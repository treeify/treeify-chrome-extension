import {Model} from 'src/TreeifyWindow/Model/Model'

/** データベースファイル選択ダイアログを開く */
export function openDatabaseFileDialog() {
  ;(async () => {
    const [fileHandle] = await showOpenFilePicker()

    // この場では戻り値を使わないが、ここで確認ダイアログを出して許可をもらっておく
    await fileHandle.createWritable()

    Model.instance.databaseFileHandle = fileHandle
  })()
}
