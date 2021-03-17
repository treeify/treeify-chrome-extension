import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {ItemType} from 'src/Common/basicType'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const itemId = NextState.getTargetItemPath().itemId
  switch (NextState.getItemType(itemId)) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      // ウェブページアイテムのタイトル設定ダイアログを表示する
      NextState.setWebPageItemTitleSettingDialog({})
      break
  }
}
