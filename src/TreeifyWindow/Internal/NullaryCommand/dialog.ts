import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {MainAreaContentView} from 'src/TreeifyWindow/View/MainArea/MainAreaContentProps'

/** アイテムの種類に応じた編集系ダイアログなどを出す */
export function edit() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  switch (Internal.instance.state.items[targetItemId].itemType) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      // ウェブページアイテムのタイトル設定ダイアログを表示する
      const domElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const domElement = document
        .getElementById(domElementId)
        ?.querySelector('.main-area-web-page-content_title')
      if (domElement != null) {
        CurrentState.setWebPageItemTitleSettingDialog({
          type: 'WebPageItemTitleSettingDialog',
          targetItemRect: domElement.getBoundingClientRect(),
        })
      }

      break
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[targetItemId]
      CurrentState.setCodeBlockItemEditDialog({
        type: 'CodeBlockItemEditDialog',
        code: codeBlockItem.code,
        language: codeBlockItem.language,
      })
      break
    case ItemType.TEX:
      CurrentState.setTexEditDialog({type: 'TexEditDialog'})
      break
  }
}

/** デフォルトウィンドウモード設定ダイアログを表示する */
export function showDefaultWindowModeSettingDialog() {
  CurrentState.setDefaultWindowModeSettingDialog({type: 'DefaultWindowModeSettingDialog'})
}

/** ワークスペースダイアログを表示する */
export function showWorkspaceDialog() {
  CurrentState.setWorkspaceDialog({type: 'WorkspaceDialog'})
}

/** ラベル編集ダイアログを表示する */
export function showLabelEditDialog() {
  const labels = CurrentState.getLabels(CurrentState.getTargetItemPath())
  if (labels.isEmpty()) {
    // 空の入力欄を1つ表示するよう設定する（入力欄が0個だと見た目が奇妙だしわざわざ+ボタンを押すのが面倒）
    CurrentState.setLabelEditDialog({type: 'LabelEditDialog', labels: List.of('')})
  } else {
    CurrentState.setLabelEditDialog({type: 'LabelEditDialog', labels})
  }
}

/** 他のトランスクルード元ダイアログを表示する */
export function showOtherParentsDialog() {
  CurrentState.setOtherParentsDialog({type: 'OtherParentsDialog'})
}

/** 検索ダイアログを表示する */
export function showSearchDialog() {
  CurrentState.setSearchDialog({type: 'SearchDialog'})
}

/** 出典設定ダイアログを表示する */
export function showCitationSettingDialog() {
  CurrentState.setCitationSettingDialog({type: 'CitationSettingDialog'})
}
