import {List} from 'immutable'
import {ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {MainAreaContentView} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

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
        CurrentState.setDialog({
          type: 'WebPageItemTitleSettingDialog',
          targetItemRect: domElement.getBoundingClientRect(),
        })
      }

      break
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[targetItemId]
      CurrentState.setDialog({
        type: 'CodeBlockItemEditDialog',
        code: codeBlockItem.code,
        language: codeBlockItem.language,
      })
      break
    case ItemType.TEX:
      CurrentState.setDialog({type: 'TexEditDialog'})
      break
  }
}

/** デフォルトウィンドウモード設定ダイアログを表示する */
export function showDefaultWindowModeSettingDialog() {
  CurrentState.setDialog({type: 'DefaultWindowModeSettingDialog'})
}

/** ワークスペースダイアログを表示する */
export function showWorkspaceDialog() {
  CurrentState.setDialog({type: 'WorkspaceDialog'})
}

/** ラベル設定ダイアログを表示する */
export function showLabelSettingDialog() {
  const labels = CurrentState.getLabels(CurrentState.getTargetItemPath())
  if (labels.isEmpty()) {
    // 空の入力欄を1つ表示するよう設定する（入力欄が0個だと見た目が奇妙だしわざわざ+ボタンを押すのが面倒）
    CurrentState.setDialog({type: 'LabelSettingDialog', labels: List.of('')})
  } else {
    CurrentState.setDialog({type: 'LabelSettingDialog', labels})
  }
}

/** 他のトランスクルード元ダイアログを表示する */
export function showOtherParentsDialog() {
  CurrentState.setDialog({type: 'OtherParentsDialog'})
}

/** 検索ダイアログを表示する */
export function showSearchDialog() {
  CurrentState.setDialog({type: 'SearchDialog'})
}

/** 出典設定ダイアログを表示する */
export function showCitationSettingDialog() {
  CurrentState.setDialog({type: 'CitationSettingDialog'})
}

/** 独自コンテキストメニューを表示する */
export function showContextMenuDialog() {
  CurrentState.setDialog({type: 'ContextMenuDialog'})
}
