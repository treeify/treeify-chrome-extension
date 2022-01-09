import { State } from 'src/TreeifyTab/Internal/State'
import { compress, decompress } from 'src/Utility/gzip'

export const CURRENT_SCHEMA_VERSION = 1 as const

export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static readonly FILE_NAME = `Treeify data.json.gz`

  /** データファイルにStateを書き込み、完了後のファイルのタイムスタンプを返す */
  async writeState(state: State): Promise<number> {
    const content = await compress(JSON.stringify(state))

    const fileHandle = await this.dataFolderHandle.getFileHandle(DataFolder.FILE_NAME, {
      create: true,
    })
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(new Blob(content))
    await writableFileStream.close()

    const file = await fileHandle.getFile()
    return file.lastModified
  }

  async fetchLastModified(): Promise<number | undefined> {
    try {
      const fileHandle = await this.dataFolderHandle.getFileHandle(DataFolder.FILE_NAME)
      const file = await fileHandle.getFile()
      return file.lastModified
    } catch (e) {
      return undefined
    }
  }

  async readState(): Promise<State | undefined> {
    try {
      const fileHandle = await this.dataFolderHandle.getFileHandle(DataFolder.FILE_NAME)
      const file = await fileHandle.getFile()
      const text = await decompress(await file.arrayBuffer())
      return JSON.parse(text)
    } catch (e) {
      return undefined
    }
  }
}
