import { List } from 'immutable'
import { Instance, InstanceId } from 'src/TreeifyTab/Instance'
import { State } from 'src/TreeifyTab/Internal/State'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { compress, decompress } from 'src/Utility/gzip'
import { Timestamp } from 'src/Utility/Timestamp'

export const CURRENT_SCHEMA_VERSION = 1 as const

type InstanceFile = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  lastModified: Timestamp
  // 「このインスタンスフォルダは他インスタンスの更新をどの範囲まで把握しているか？」を表すためのデータ。
  // Keyは存在を把握している他インスタンスID、Valueは把握している最新の更新タイムスタンプ。
  known: Record<InstanceId, Timestamp>
  state: State
}

export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static getInstanceFileName(instanceId: InstanceId = Instance.getId()) {
    return `Instance ID = ${instanceId}.json.gz`
  }

  private static INSTANCE_FILE_NAME_PATTERN: RegExp = /Instance ID = (.+)\.json\.gz/

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
   * 単純にファイルをコピーするのとは微妙に異なり、メタデータを自インスタンス視点で更新する。
   */
  async copyFrom(instanceFile: InstanceFile) {
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

  private async getAllOtherInstanceTimestamps(): Promise<Record<InstanceId, Timestamp>> {
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

  async readInstanceFile(
    instanceId: InstanceId = Instance.getId()
  ): Promise<InstanceFile | undefined> {
    const fileName = DataFolder.getInstanceFileName(instanceId)
    try {
      const fileHandle = await this.dataFolderHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      const text = await decompress(await file.arrayBuffer())
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
    const content = await compress(text)
    await writableFileStream.write(new Blob(content))
    await writableFileStream.close()
  }
}
