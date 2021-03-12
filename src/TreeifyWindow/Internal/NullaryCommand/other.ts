import {External} from 'src/TreeifyWindow/External/External'
import {State} from 'src/TreeifyWindow/Internal/State'
import {cleanup, startup} from 'src/TreeifyWindow/startup'

/** データベースファイル選択ダイアログを開く */
export function openDatabaseFileDialog() {
  ;(async () => {
    const [fileHandle] = await showOpenFilePicker()

    const file = await fileHandle.getFile()
    const fileContents = await file.text()
    const state = State.fromJsonString(fileContents)
    if (state === undefined) {
      // 読み込みに失敗した場合
      // TODO: 読み込み失敗をユーザーに伝える
    } else {
      // 事実上の再起動を行う。
      // ただしStateは読み込んだものを使う。
      await cleanup()
      await startup(state)

      // この場では戻り値を使わないが、ここで確認ダイアログを出して許可をもらっておく
      await fileHandle.createWritable()

      External.instance.databaseFileHandle = fileHandle
    }
  })()
}
