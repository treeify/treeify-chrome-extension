import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {ItemType} from 'src/Common/basicType'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const targetItemPath = NextState.getTargetItemPath()
  switch (NextState.getItemType(targetItemPath.itemId)) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      // ウェブページアイテムのタイトル設定ダイアログを表示する
      const domElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
      const domElement = document
        .getElementById(domElementId)
        ?.querySelector('.item-tree-web-page-content_title')
      if (domElement !== null) {
        NextState.setWebPageItemTitleSettingDialog({
          targetItemRect: domElement.getBoundingClientRect(),
        })
      }

      break
  }
}
