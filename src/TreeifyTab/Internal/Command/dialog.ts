import {assertNonNull} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {MainAreaContentView} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

/** 項目の種類に応じた編集系ダイアログなどを出す */
export function showEditDialog() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  switch (Internal.instance.state.items[targetItemId].type) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      // ウェブページ項目のタイトル設定ダイアログを表示する
      const domElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const domElement = document
        .getElementById(domElementId)
        ?.querySelector('.main-area-web-page-content_title')
      if (domElement != null) {
        External.instance.dialogState = {
          type: 'WebPageItemTitleSettingDialog',
          targetItemRect: domElement.getBoundingClientRect(),
        }
      }

      break
    case ItemType.IMAGE:
      External.instance.dialogState = {type: 'ImageItemEditDialog'}
      break
    case ItemType.CODE_BLOCK:
      External.instance.dialogState = {type: 'CodeBlockItemEditDialog'}
      break
    case ItemType.TEX:
      External.instance.dialogState = {type: 'TexEditDialog'}
      break
  }
}

/** ワークスペースダイアログを表示する */
export function showWorkspaceDialog() {
  External.instance.dialogState = {type: 'WorkspaceDialog'}
}

/** 他のトランスクルード元ダイアログを表示する */
export function showOtherParentsDialog() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (CurrentState.countParents(targetItemId) >= 2) {
    External.instance.dialogState = {type: 'OtherParentsDialog'}
  }
}

/** 検索ダイアログを表示する */
export function showSearchDialog() {
  External.instance.dialogState = {type: 'SearchDialog'}
}

/** 出典設定ダイアログを表示する */
export function showCitationSettingDialog() {
  External.instance.dialogState = {type: 'CitationSettingDialog'}
}

/** 独自コンテキストメニューを表示する */
export function showContextMenuDialog() {
  const domElementId = MainAreaContentView.focusableDomElementId(CurrentState.getTargetItemPath())
  const domElement = document.getElementById(domElementId)
  assertNonNull(domElement)
  const rect = domElement.getBoundingClientRect()
  const mousePosition = {x: rect.x, y: rect.bottom}
  External.instance.dialogState = {type: 'ContextMenuDialog', mousePosition}
}
