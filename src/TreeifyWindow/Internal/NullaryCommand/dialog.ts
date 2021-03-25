import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {ItemType} from 'src/Common/basicType'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const targetItemPath = NextState.getTargetItemPath()
  switch (Internal.instance.state.items[ItemPath.getItemId(targetItemPath)].itemType) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      // ウェブページアイテムのタイトル設定ダイアログを表示する
      const domElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
      const domElement = document
        .getElementById(domElementId)
        ?.querySelector('.item-tree-web-page-content_title')
      if (domElement != null) {
        NextState.setWebPageItemTitleSettingDialog({
          targetItemRect: domElement.getBoundingClientRect(),
        })
      }

      break
  }
}
