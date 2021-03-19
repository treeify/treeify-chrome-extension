import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'

/** データフォルダ選択ダイアログを開く */
export function openDataFolderPicker() {
  doAsyncWithErrorHandling(async () => {
    const directoryHandle = await showDirectoryPicker()

    // TODO: ファイル群を読み込んでパースし、cleanupとstartupを行う
  })
}
