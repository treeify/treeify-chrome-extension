import { State } from 'src/TreeifyTab/Internal/State'
import { compress, decompress } from 'src/Utility/gzip'

export const CURRENT_SCHEMA_VERSION = 1 as const

export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static readonly FILE_NAME = `Treeify data.json.gz`

  async writeState(state: State) {
    const text = JSON.stringify(state, State.jsonReplacer)
    const content = await compress(text)

    const fileHandle = await this.dataFolderHandle.getFileHandle(DataFolder.FILE_NAME, {
      create: true,
    })
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(new Blob(content))
    await writableFileStream.close()
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
      return JSON.parse(text, State.jsonReviver)
    } catch (e) {
      return undefined
    }
  }
}
