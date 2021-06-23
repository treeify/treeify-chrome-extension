import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentProps'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  switch (Internal.instance.state.items[targetItemId].itemType) {
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
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[targetItemId]
      CurrentState.setCodeBlockItemEditDialog({
        code: codeBlockItem.code,
        language: codeBlockItem.language,
      })
      break
    case ItemType.TEX:
      CurrentState.setTexEditDialog({})
      break
  }
}

/** デフォルトウィンドウモード設定ダイアログを表示する */
export function showDefaultWindowModeSettingDialog() {
  CurrentState.setDefaultWindowModeSettingDialog({})
}

/** ワークスペースダイアログを表示する */
export function showWorkspaceDialog() {
  CurrentState.setWorkspaceDialog({})
}

/** ラベル編集ダイアログを表示する */
export function showLabelEditDialog() {
  const labels = CurrentState.getLabels(CurrentState.getTargetItemPath())
  if (labels.isEmpty()) {
    // 空の入力欄を1つ表示するよう設定する（入力欄が0個だと見た目が奇妙だしわざわざ+ボタンを押すのが面倒）
    CurrentState.setLabelEditDialog({labels: List.of('')})
  } else {
    CurrentState.setLabelEditDialog({labels})
  }
}

/** 他のトランスクルード元ダイアログを表示する */
export function showOtherParentsDialog() {
  CurrentState.setOtherParentsDialog({})
}

/** 検索ダイアログを表示する */
export function showSearchDialog() {
  CurrentState.setSearchDialog({})
}
