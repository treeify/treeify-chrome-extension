import dayjs from 'dayjs'
import { pipe } from 'fp-ts/function'
import { State } from 'src/TreeifyTab/Internal/State'
import { assertNonNull } from 'src/Utility/Debug/assert'
import { Option$, RArray$ } from 'src/Utility/fp-ts'
import { compress } from 'src/Utility/gzip'

export namespace GoogleDrive {
  const SNAPSHOT_FILE_NAME = 'snapshot.json.gz'
  const DATA_FOLDER_NAME = 'Treeify'

  export async function getAccessToken(): Promise<string> {
    return new Promise<string>((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, resolve)
    })
  }

  export type DataFileMataData = {
    id: string
    name: string
    modifiedTime: string
  }

  export async function fetchDataFileMetaData(): Promise<DataFileMataData | undefined> {
    const dataFiles = await GoogleDrive.searchFile(SNAPSHOT_FILE_NAME)
    // タイムスタンプが最新のデータファイルを選ぶ。
    // 複数が該当する場合はIDのソート順で先頭のものを選ぶ。
    return pipe(
      dataFiles,
      RArray$.sortBy((dataFile: DataFileMataData) => dataFile.id),
      RArray$.maxBy((dataFile: DataFileMataData) => dayjs(dataFile.modifiedTime).valueOf()),
      Option$.toUndefined
    )
  }

  export async function searchFile(fileName: string): Promise<DataFileMataData[]> {
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

  /**
   * データファイルとそれを格納するフォルダを作成する。
   * Google Drive内にTreeifyのデータファイルが存在しない場合に呼び出される。
   */
  export async function createDataFile(state: State) {
    const folderResponse = await createFolder(DATA_FOLDER_NAME)
    const folderResponseJson = await folderResponse.json()

    const gzipped = await compress(JSON.stringify(state))
    const fileResponse = await GoogleDrive.createFileWithMultipart(
      SNAPSHOT_FILE_NAME,
      new Blob(gzipped),
      folderResponseJson.id
    )
    const responseJson = await fileResponse.json()
    return responseJson.modifiedTime
  }

  export async function createFileWithMultipart(
    fileName: string,
    fileContent: Blob,
    folderId?: string
  ): Promise<Response> {
    const parents = folderId !== undefined ? [folderId] : []
    const metadata = JSON.stringify({ name: fileName, parents })
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

  export async function createFolder(folderName: string): Promise<Response> {
    const metadata = JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    })
    const formData = new FormData()
    formData.append('metadata', new Blob([metadata], { type: 'application/json' }))

    const params = new URLSearchParams({
      uploadType: 'multipart',
      fields: 'id',
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
