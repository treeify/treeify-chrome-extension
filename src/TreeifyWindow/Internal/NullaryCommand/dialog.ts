import {NextState} from 'src/TreeifyWindow/Internal/NextState'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  // ウェブページアイテムのタイトル設定ダイアログを表示する
  NextState.setWebPageItemTitleSettingDialog({})
}
