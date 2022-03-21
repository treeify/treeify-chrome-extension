import dayjs from 'dayjs'
import { pipe } from 'fp-ts/function'
import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CURRENT_SCHEMA_VERSION, State } from 'src/TreeifyTab/Internal/State'
import { getGoogleDriveSyncedAt, setGoogleDriveSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { restart } from 'src/TreeifyTab/startup'
import { assertNonNull } from 'src/Utility/Debug/assert'
import { debugLog, dump, postErrorMessage } from 'src/Utility/Debug/logger'
import { Option$, RArray$ } from 'src/Utility/fp-ts'
import { compress, decompress } from 'src/Utility/gzip'

export namespace GoogleDrive {
  const SNAPSHOT_FILE_NAME = 'snapshot.json.gz'
  const DATA_FOLDER_NAME = 'Treeify'

  async function getAccessToken(): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, resolve)
    })
  }

  export type DataFileMataData = {
    id: string
    name: string
    modifiedTime: string
  }

  export async function fetchDataFileMetaData(): Promise<DataFileMataData | undefined> {
    const dataFiles = await searchFile(SNAPSHOT_FILE_NAME)
    // タイムスタンプが最新のデータファイルを選ぶ。
    // 複数が該当する場合はIDのソート順で先頭のものを選ぶ。
    return pipe(
      dataFiles,
      RArray$.sortBy((dataFile: DataFileMataData) => dataFile.id),
      RArray$.maxBy((dataFile: DataFileMataData) => dayjs(dataFile.modifiedTime).valueOf()),
      Option$.toUndefined
    )
  }

  async function searchFile(fileName: string): Promise<DataFileMataData[]> {
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

  async function readFile(fileId: string): Promise<Response> {
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
   * Googleドライブ内にTreeifyのデータファイルが存在しない場合に呼び出される。
   */
  async function createDataFile(state: State) {
    const folderResponse = await createFolder(DATA_FOLDER_NAME)
    const folderResponseJson = await folderResponse.json()

    const gzipped = await compress(JSON.stringify(state))
    const fileResponse = await createFileWithMultipart(
      SNAPSHOT_FILE_NAME,
      new Blob(gzipped),
      folderResponseJson.id
    )
    const responseJson = await fileResponse.json()
    return responseJson.modifiedTime
  }

  async function createFileWithMultipart(
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

  async function createFolder(folderName: string): Promise<Response> {
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

  async function updateFile(fileId: string, fileContent: Blob): Promise<Response> {
    const params = new URLSearchParams({
      uploadType: 'media',
      fields: 'modifiedTime',
    })
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?${params}`
    return await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: fileContent,
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

  export async function syncTreeifyData() {
    // ユーザーが認証用ログイン画面を閉じたりしたら、
    // getAccessToken()は何も応答しない。
    // なのでローディングインジケーターが無限にぐるぐるするのを防ぐために
    // このタイミングでgetAccessToken()を呼んでおく。
    const accessToken = await getAccessToken()

    // ユーザーが権限付与をキャンセルした場合は何もせず終了する
    if (accessToken === undefined) return

    if (External.instance.isInSync) return

    External.instance.isInSync = true
    Rerenderer.instance.rerender()
    try {
      const dataFileMetaData = await GoogleDrive.fetchDataFileMetaData()
      await syncWithGoogleDrive(dataFileMetaData)
    } catch {
      debugLog('リトライ', dayjs().format('MM/DD HH:mm:ss'))
      try {
        // 特に自動同期がオフラインでエラーになる不具合の対策として、API呼び出しをリトライする
        const dataFileMetaData = await GoogleDrive.fetchDataFileMetaData()
        await syncWithGoogleDrive(dataFileMetaData)
      } catch (error) {
        console.error(error)
        External.instance.hasSyncIssue = true
      }
    } finally {
      External.instance.isInSync = false
      Rerenderer.instance.rerender()
    }
  }

  export async function syncWithGoogleDrive(
    dataFileMetaData: GoogleDrive.DataFileMataData | undefined
  ) {
    if (dataFileMetaData === undefined) {
      // データファイルがない場合
      debugLog('データファイルがない場合')

      debugLog('create APIを呼んでファイル更新日時を記録して終了')
      // データファイルを作成し、日時を記録して終了
      const modifiedTime = await createDataFile(Internal.instance.state)
      setGoogleDriveSyncedAt(modifiedTime)
      External.instance.hasUpdatedAfterSync = false
      External.instance.hasSyncIssue = false
      Rerenderer.instance.rerender()
    } else {
      // データファイルがある場合
      debugLog('データファイルがある場合')

      const syncedAt = getGoogleDriveSyncedAt()
      const knownTimestamp = syncedAt !== undefined ? new Date(syncedAt).getTime() : -1
      const dataFileTimestamp = new Date(dataFileMetaData.modifiedTime).getTime()
      if (knownTimestamp !== dataFileTimestamp) {
        // データファイルの更新日時が既知の値でなければ

        debugLog('データファイルの更新日時が既知の値でなければ')
        dump(syncedAt, dataFileMetaData.modifiedTime)

        const state: State = await getState(dataFileMetaData)

        if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
          showRequireUpdateMessage()
          return
        }

        if (syncedAt === undefined) {
          setGoogleDriveSyncedAt(dataFileMetaData.modifiedTime)
          await restart(state, true)
        } else {
          // Stateの上書きによって失われるデータの量を最小化するために、どちらのStateが新しいかを判定する
          if (State.isNewerThan(state, Internal.instance.state, knownTimestamp)) {
            setGoogleDriveSyncedAt(dataFileMetaData.modifiedTime)
            await restart(state)
          } else {
            postErrorMessage(
              'データファイルのタイムスタンプが未知の値だったが、ローカルデータの方が先に進んでいた'
            )

            const gzipped = await compress(JSON.stringify(Internal.instance.state))
            const response = await updateFile(dataFileMetaData.id, new Blob(gzipped))
            const responseJson = await response.json()
            setGoogleDriveSyncedAt(responseJson.modifiedTime)
            External.instance.hasUpdatedAfterSync = false
            External.instance.hasSyncIssue = false
            Rerenderer.instance.rerender()
          }
        }
      } else {
        // データファイルの更新日時が既知の値であれば

        debugLog('データファイルの更新日時が既知の値であれば')

        // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
        if (!External.instance.hasUpdatedAfterSync) return

        const gzipped = await compress(JSON.stringify(Internal.instance.state))
        const response = await updateFile(dataFileMetaData.id, new Blob(gzipped))
        const responseJson = await response.json()
        setGoogleDriveSyncedAt(responseJson.modifiedTime)
        External.instance.hasUpdatedAfterSync = false
        External.instance.hasSyncIssue = false
        Rerenderer.instance.rerender()
      }
    }
  }

  async function getState(metaData: GoogleDrive.DataFileMataData): Promise<State> {
    const response = await readFile(metaData.id)
    const text = await decompress(await response.arrayBuffer())
    return JSON.parse(text)
  }

  function showRequireUpdateMessage() {
    alert(
      'Treeifyのバージョンが古いためデータファイルを読み込めません。\nアップデートしてください。'
    )
  }
}
