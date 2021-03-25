import {Chunk, ChunkId} from 'src/TreeifyWindow/Internal/Chunk'
import {List} from 'immutable'

/**
 * Treeifyのデータを格納する専用フォルダを管理するクラス。
 *
 * 【なぜファイルではなくフォルダか】
 * 1つのファイルに全データを詰め込む形式では（APIの仕様上）差分書き込みができないのでフォルダ形式にした。
 * 大量の小さなファイルに分けて保存し、一部のファイルのみ書き換えることで差分書き込みを実現する。
 * もし差分書き込みを怠ると、自動保存機能によって1日あたり合計10GB以上ものデータが書き込まれる可能性があり、
 * SSDの寿命を縮めたりPCの動作を遅くしてしまう恐れがある。
 */
export class DataFolder {
  constructor(private readonly folderHandle: FileSystemDirectoryHandle) {}

  /** 選択されたフォルダ内の全ファイルを読み込んでチャンク化する */
  async readAllChunks(): Promise<List<Chunk>> {
    const promises = []
    for await (const fileSystemHandle of this.folderHandle.values()) {
      if (fileSystemHandle.kind === 'file' && fileSystemHandle.name.endsWith('.json')) {
        promises.push(DataFolder.readChunk(fileSystemHandle))
      }
    }
    return List(await Promise.all(promises))
  }

  // 指定されたファイルを読み込んでチャンク化する
  private static async readChunk(fileHandle: FileSystemFileHandle): Promise<Chunk> {
    const file = await fileHandle.getFile()
    return {
      // 拡張子を除去してチャンクIDを得る
      id: fileHandle.name.replace('.json', ''),
      json: await file.text(),
    }
  }

  async writeChunks(chunks: List<Chunk>) {
    await Promise.all(chunks.map((chunk) => this.writeChunk(chunk)))
  }

  async writeChunk(chunk: Chunk) {
    const fileName = `${chunk.id}.json`
    const fileHandle = await this.folderHandle.getFileHandle(fileName, {create: true})
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(chunk.json)
    await writableFileStream.close()
  }

  async deleteFile(chunkId: ChunkId) {
    const fileName = `${chunkId}.json`
    await this.folderHandle.removeEntry(fileName)
  }
}
