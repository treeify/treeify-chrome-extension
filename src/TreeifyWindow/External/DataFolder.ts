import {Chunk, ChunkId} from 'src/TreeifyWindow/Internal/Chunk'
import {List} from 'immutable'
import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {assert} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/basicType'
import {State} from 'src/TreeifyWindow/Internal/State'

// データフォルダをルートとするファイルパス。
// "./"や"../"のような相対ファイルパスの概念はない。
// ファイルパスと言いつつフォルダもこれで表すので注意。
// 空リストはデータフォルダ自身を表す。
type FilePath = List<string>

/**
 * Treeifyのデータを格納する専用フォルダ（「データフォルダ」と呼ぶ）を管理するクラス。
 * 普通のアプリなら単一ファイルで書き出すところを、Treeifyではフォルダ内の複数ファイルに書き出す（理由は後述）。
 * さらに特殊なことに、デバイスIDごとの専用フォルダの下に書き出す（理由は後述その2）。
 * そのため複数デバイスで同じデータフォルダに書き込むと、その分だけサブフォルダが増えてデータ量が倍増する。
 *
 * 【なぜファイルではなくフォルダか】
 * 1つのファイルに全データを詰め込む形式では（APIの仕様上）差分書き込みができないのでフォルダ形式にした。
 * 大量の小さなファイルに分けて保存し、一部のファイルのみ書き換えることで差分書き込みを実現する。
 * もし差分書き込みを怠ると、自動保存機能によって1日あたり合計10GB以上ものデータが書き込まれる可能性があり、
 * SSDの寿命を縮めたりPCの動作を遅くしてしまう恐れがある。
 *
 * 【なぜデバイスごとのフォルダに保存するのか】
 * データフォルダはGoogleドライブなどのオンラインストレージでリアルタイム同期されることを想定している。
 * オンラインストレージはファイル単位で同期するので、場合によっては全体としての整合性が壊れる可能性がある。
 * そこで、自デバイス用のフォルダには他デバイスが絶対に書き込まないことで整合性を保証する。
 * デバイス間でのデータ共有のために、他デバイスフォルダから必要に応じて自デバイスフォルダにデータを取り込む形式を取る。
 * この方式では保存データ量が倍増するが、Treeifyのデータ量は元々少ないので数倍になった程度では誤差でしかない。
 * （超ヘビーユーザーでも1デバイス分のデータ量が10MBを超えることはほぼないという試算結果が出ている）
 */
export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static devicesFolderPath = List.of('Devices')
  private static getDeviceFolderPath(deviceId: DeviceId): FilePath {
    return this.devicesFolderPath.push(deviceId)
  }
  private static getChunksFolderPath(deviceId: DeviceId): FilePath {
    return this.getDeviceFolderPath(deviceId).push('Chunks')
  }

  /** 選択されたフォルダ内の全ファイルを読み込んでチャンク化する */
  async readAllChunks(): Promise<List<Chunk>> {
    const chunksFolderPath = DataFolder.getChunksFolderPath(DeviceId.get())
    const fileNames = await this.getChunkFileNames(DeviceId.get())
    const chunkPromises = fileNames
      .map((fileName) => chunksFolderPath.push(fileName))
      .map((filePath) => this.readJsonFile(filePath))
    return List(await Promise.all(chunkPromises)) as List<Chunk>
  }

  async writeChunks(chunks: List<Chunk>) {
    await Promise.all(chunks.map((chunk) => this.writeChunk(chunk)))
  }

  async writeChunk(chunk: Chunk) {
    const fileName = DataFolder.deriveFileName(chunk.id)
    const chunksFolderPath = DataFolder.getChunksFolderPath(DeviceId.get())
    const chunkFilePath = chunksFolderPath.push(fileName)

    const fileHandle = await this.getFileHandle(chunkFilePath)
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(JSON.stringify(chunk, State.jsonReplacer))
    await writableFileStream.close()
  }

  async deleteChunk(chunkId: ChunkId) {
    const fileName = DataFolder.deriveFileName(chunkId)
    const chunksFolderPath = DataFolder.getChunksFolderPath(DeviceId.get())
    const chunksFolderHandle = await this.getFolderHandle(chunksFolderPath)
    await chunksFolderHandle.removeEntry(fileName)
  }

  // 指定されたパスのフォルダハンドルを取得する。
  // 無ければ作る。
  private async getFolderHandle(
    folderPath: FilePath,
    folderHandle = this.dataFolderHandle
  ): Promise<FileSystemDirectoryHandle> {
    if (folderPath.isEmpty()) {
      return folderHandle
    }
    const directoryHandle = await folderHandle.getDirectoryHandle(folderPath.first(), {
      create: true,
    })
    return this.getFolderHandle(folderPath.shift(), directoryHandle)
  }

  // 指定されたパスのファイルハンドルを取得する。
  // 無ければ作る。
  private async getFileHandle(
    filePath: FilePath,
    folderHandle = this.dataFolderHandle
  ): Promise<FileSystemFileHandle> {
    assert(!filePath.isEmpty())
    if (filePath.size === 1) {
      return await folderHandle.getFileHandle(filePath.first(), {create: true})
    }
    const nextFolderHandle = await folderHandle.getDirectoryHandle(filePath.first(), {create: true})
    return this.getFileHandle(filePath.shift(), nextFolderHandle)
  }

  // データフォルダ内に存在する各デバイスフォルダのフォルダ名もといデバイスIDを返す
  private async getAllExistingDeviceIds(): Promise<List<DeviceId>> {
    const devicesFolder = await this.getFolderHandle(DataFolder.devicesFolderPath)
    const deviceIds = []
    for await (const deviceFolder of devicesFolder.values()) {
      if (deviceFolder.kind === 'directory') {
        deviceIds.push(deviceFolder.name)
      }
    }
    return List(deviceIds)
  }

  // 全チャンクファイルのファイル名のリストを返す
  private async getChunkFileNames(deviceId = DeviceId.get()): Promise<List<string>> {
    const chunksFolderPath = DataFolder.getChunksFolderPath(deviceId)
    const chunksFolderHandle = await this.getFolderHandle(chunksFolderPath)
    const fileNames = []
    for await (const fileName of chunksFolderHandle.keys()) {
      // ファイルかどうかのチェックはしていない。
      // データフォルダを弄った場合の動作は保証しない。
      fileNames.push(fileName)
    }
    return List(fileNames)
  }

  // 指定されたファイルの最終更新日時を返す
  private async getLastModified(filePath: FilePath): Promise<integer> {
    const fileHandle = await this.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return file.lastModified
  }

  private async readTextFile(filePath: FilePath): Promise<string> {
    const fileHandle = await this.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return await file.text()
  }

  private async readJsonFile(filePath: FilePath): Promise<unknown> {
    const text = await this.readTextFile(filePath)
    return JSON.parse(text, State.jsonReviver)
  }

  private static deriveFileName(chunkId: ChunkId): string {
    return `${chunkId}.json`

    // ↓複数チャンクを1つのファイルにパッキングすることを検討した際のコード。たぶん使うことになるので残しておく

    // const propertyPath = ChunkId.toPropertyPath(chunkId)
    // const first = propertyPath.first() as keyof State
    // switch (first) {
    //   case 'items':
    //   case 'textItems':
    //   case 'webPageItems':
    //     // チャンク数が肥大化するグループ
    //     // TODO: フラグメンテーション対策に計算式を変えると思う
    //     const itemId = parseInt(propertyPath.get(1) as string)
    //     return `${first}${Math.floor(itemId / 100)}.json`
    //   case 'pages':
    //   case 'isFloatingLeftSidebarShown':
    //   case 'activePageId':
    //     // ミューテーションされる頻度が非常に高いグループ
    //     return `${first}.json`
    //   default:
    //     // その他のグループ
    //     return `other.json`
    // }
  }
}
