import { List } from 'immutable'
import { Instance, InstanceId } from 'src/TreeifyTab/Instance'
import { State } from 'src/TreeifyTab/Internal/State'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { Timestamp } from 'src/Utility/Timestamp'

export const CURRENT_SCHEMA_VERSION = 1 as const

type InstanceFile = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  lastModified: Timestamp
  // 「このインスタンスフォルダは他インスタンスの更新をどの範囲まで把握しているか？」を表すためのデータ。
  // Keyは存在を把握している他インスタンスID、Valueは把握している最新の更新タイムスタンプ。
  known: { [K in InstanceId]: Timestamp }
  state: State
}

export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static getInstanceFileName(instanceId: InstanceId = Instance.getId()) {
    return `Instance ID = ${instanceId}.json`
  }

  private static INSTANCE_FILE_NAME_PATTERN: RegExp = /Instance ID = (.+)\.json/

  static async isDataFolder(folderHandle: FileSystemDirectoryHandle): Promise<boolean> {
    for await (const key of folderHandle.keys()) {
      // .DS_Storeファイルや.gitフォルダなどは無視する
      if (key.startsWith('.')) continue

      if (this.INSTANCE_FILE_NAME_PATTERN.test(key)) continue

      return false
    }
    return true
  }

  async writeState(state: State) {
    const instanceFile = await this.readInstanceFile()
    await this.writeInstanceFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastModified: Timestamp.now(),
      known: instanceFile?.known ?? {},
      state,
    })
  }

  /**
   * 他インスタンスフォルダのデータを自インスタンスフォルダに取り込む。
   * 単純に全ファイルをコピーするだけでなく、メタデータファイルを自インスタンス視点で更新する。
   */
  async copyFrom(instanceId: InstanceId) {
    const instanceFile = await this.readInstanceFile(instanceId)
    assertNonUndefined(instanceFile)

    await this.writeInstanceFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastModified: Timestamp.now(),
      known: await this.getAllOtherInstanceTimestamps(),
      state: instanceFile.state,
    })
  }

  // データフォルダ内に存在する各インスタンスフォルダのフォルダ名もといインスタンスIDを返す
  private async getAllExistingInstanceIds(): Promise<List<InstanceId>> {
    const instanceIds = []
    for await (const entry of this.dataFolderHandle.values()) {
      if (entry.kind === 'directory') continue

      const result = DataFolder.INSTANCE_FILE_NAME_PATTERN.exec(entry.name)
      if (result?.[1] !== undefined) {
        instanceIds.push(result[1])
      }
    }
    return List(instanceIds)
  }

  // 全ての他インスタンスフォルダのフォルダ名もといインスタンスIDを返す
  private async getAllOtherInstanceIds(): Promise<List<InstanceId>> {
    const instanceIds = await this.getAllExistingInstanceIds()
    return instanceIds.filter((instanceId) => instanceId !== Instance.getId())
  }

  private async getAllOtherInstanceTimestamps(): Promise<{ [K in InstanceId]: Timestamp }> {
    const instanceIds = await this.getAllOtherInstanceIds()
    const timestampPromises = instanceIds.map(async (instanceId) => {
      const instanceFile = await this.readInstanceFile(instanceId)
      assertNonUndefined(instanceFile)
      return [instanceId, instanceFile.lastModified]
    })
    const entries = await Promise.all(timestampPromises)
    return Object.fromEntries(entries)
  }

  /**
   * 自インスタンスが存在を把握していないインスタンスフォルダ、または把握していない更新の行われたインスタンスフォルダのインスタンスIDを返す。
   * 複数インスタンスが該当する場合は、タイムスタンプが最も新しいものを返す。
   * 自インスタンスフォルダに何も書き込まれていない場合、タイムスタンプが最も新しいインスタンスのIDを返す。
   */
  async findUnknownUpdatedInstance(): Promise<InstanceId | undefined> {
    const instanceFile = await this.readInstanceFile()
    if (instanceFile === undefined) {
      // 自インスタンスフォルダに何も書き込まれていない場合、タイムスタンプが最も新しいインスタンスのIDを返す
      const otherInstanceTimestamps = List(
        Object.entries(await this.getAllOtherInstanceTimestamps())
      )
      const latestUpdated = otherInstanceTimestamps.maxBy(([instanceId, timestamp]) => timestamp)
      return latestUpdated?.[0]
    }

    const otherInstanceIds = await this.getAllOtherInstanceIds()
    const timestampPromises = otherInstanceIds.map(async (instanceId) => {
      const instanceFile = await this.readInstanceFile(instanceId)
      assertNonUndefined(instanceFile)
      return { instanceId, lastModified: instanceFile.lastModified }
    })

    const timestamps = List(await Promise.all(timestampPromises))
    const unknownUpdatedInstanceIds = timestamps.filter(({ instanceId, lastModified }) => {
      const knownUpdateTimestamp = instanceFile.known[instanceId]
      if (knownUpdateTimestamp === undefined) {
        return true
      }
      return knownUpdateTimestamp !== lastModified
    })

    return unknownUpdatedInstanceIds.maxBy(({ lastModified }) => lastModified)?.instanceId
  }

  /**
   * 指定されたインスタンスフォルダを読み込んで問題ないかどうかを検証する。
   * 戻り値の意味は次の通り。
   * success: 読み込んで問題ない
   * incomplete: metadata.json内のhashesと各ファイルの実際のハッシュ値が食い違っている
   * unknown version: データのスキーマバージョンが高いので正しい読み込み方が分からない
   * @deprecated
   */
  async checkInstanceFolder(
    instanceId: InstanceId
  ): Promise<'success' | 'incomplete' | 'unknown version'> {
    const instanceFile = await this.readInstanceFile(instanceId)
    assertNonUndefined(instanceFile)

    if (instanceFile.schemaVersion > CURRENT_SCHEMA_VERSION) return 'unknown version'

    return 'success'
  }

  async readInstanceFile(
    instanceId: InstanceId = Instance.getId()
  ): Promise<InstanceFile | undefined> {
    const fileName = DataFolder.getInstanceFileName(instanceId)
    try {
      const fileHandle = await this.dataFolderHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      const text = await file.text()
      return JSON.parse(text, State.jsonReviver)
    } catch (e) {
      return undefined
    }
  }

  private async writeInstanceFile(instanceFile: InstanceFile): Promise<void> {
    const text = JSON.stringify(instanceFile, State.jsonReplacer)

    const fileName = DataFolder.getInstanceFileName()
    const fileHandle = await this.dataFolderHandle.getFileHandle(fileName, { create: true })
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(text)
    await writableFileStream.close()
  }
}
