import {ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const targetItemPath = CurrentState.getTargetItemPath()
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
        CurrentState.setWebPageItemTitleSettingDialog({
          targetItemRect: domElement.getBoundingClientRect(),
        })
      }

      break
  }
}
