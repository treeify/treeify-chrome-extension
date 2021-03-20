import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {DataFolder} from 'src/TreeifyWindow/Internal/NullaryCommand/DataFolder'

/** データフォルダ選択ダイアログを開く */
export function openDataFolderPicker() {
  doAsyncWithErrorHandling(async () => {
    const dataFolder = new DataFolder(await showDirectoryPicker())
    External.instance.dataFolder = dataFolder

    // TODO: ファイル群を読み込んでパースし、cleanupとstartupを行う
  })
}
