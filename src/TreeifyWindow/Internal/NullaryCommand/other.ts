import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {DataFolder} from 'src/TreeifyWindow/Internal/NullaryCommand/DataFolder'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {cleanup, startup} from 'src/TreeifyWindow/startup'
import {State} from 'src/TreeifyWindow/Internal/State'

/** データフォルダ選択ダイアログを開く */
export function openDataFolderPicker() {
  doAsyncWithErrorHandling(async () => {
    const dataFolder = new DataFolder(await showDirectoryPicker())
    const state = Chunk.inflateStateFromChunks(await dataFolder.readAllChunks())
    await cleanup()
    // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
    External.instance.dataFolder = dataFolder
    await startup(state as State)
  })
}
