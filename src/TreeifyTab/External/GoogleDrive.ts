import { assertNonNull } from 'src/Utility/Debug/assert'

export namespace GoogleDrive {
  async function getAccessToken(): Promise<string> {
    return new Promise<string>((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, resolve)
    })
  }

  export async function searchFile(fileName: string): Promise<
    {
      id: string
      name: string
      modifiedTime: string
    }[]
  > {
    const params = new URLSearchParams({
      fields: 'files/id,files/name,files/modifiedTime',
      q: `name = '${fileName}' and trashed = false`,
    })
    const url = `https://www.googleapis.com/drive/v3/files?${params}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
    })
    const responseBody = await response.json()
    return responseBody.files
  }

  export async function readFile(fileId: string): Promise<Response> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    return await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
    })
  }

  export async function createFileWithMultipart(
    fileName: string,
    fileContent: Blob
  ): Promise<Response> {
    const metadata = JSON.stringify({ name: fileName })
    const formData = new FormData()
    formData.append('metadata', new Blob([metadata], { type: 'application/json' }))
    formData.append('data', fileContent, fileName)

    const params = new URLSearchParams({
      uploadType: 'multipart',
      fields: 'modifiedTime',
    })
    const url = `https://www.googleapis.com/upload/drive/v3/files?${params}`
    return await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: formData,
    })
  }

  export async function updateFileWithMultipart(
    fileId: string,
    fileContent: Blob
  ): Promise<Response> {
    // TODO: メタデータを更新しないならシンプルのやつでいいんじゃないか？
    const metadata = JSON.stringify({})
    const formData = new FormData()
    formData.append('metadata', new Blob([metadata], { type: 'application/json' }))
    formData.append('data', fileContent)

    const params = new URLSearchParams({
      uploadType: 'multipart',
      fields: 'modifiedTime',
    })
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?${params}`
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: formData,
    })
  }

  /** TODO: 5MBを超えるときはresumableを使うと公式サイトに書かれている */
  async function createTextFileWithResumable(fileName: string, fileContent: string) {
    const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`
    const metadata = JSON.stringify({ name: fileName })
    const firstResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': new Blob([metadata]).size.toString(),
        'X-Upload-Content-Type': 'text/plain',
        'X-Upload-Content-Length': fileContent.length.toString(),
      },
      body: metadata,
    })
    const nextUrl = firstResponse.headers.get('Location')
    assertNonNull(nextUrl)
    const nextResponse = await fetch(nextUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        'Content-Type': 'text/plain',
        'Content-Length': fileContent.length.toString(),
      },
      body: fileContent,
    })
    // TODO: ファイルサイズが5MBを超える場合はさらにリクエストする必要があるらしい
    return nextResponse
  }
}
