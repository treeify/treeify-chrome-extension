import { ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'

/** 項目の種類に応じた編集系ダイアログなどを出す */
export function showEditDialog() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  switch (Internal.instance.state.items[targetItemId].type) {
    case ItemType.TEXT:
      break
    case ItemType.WEB_PAGE:
      External.instance.dialogState = { type: 'WebPageItemTitleSettingDialog' }
      break
    case ItemType.IMAGE:
      External.instance.dialogState = { type: 'ImageItemEditDialog' }
      break
    case ItemType.CODE_BLOCK:
      External.instance.dialogState = { type: 'CodeBlockItemEditDialog' }
      break
    case ItemType.TEX:
      External.instance.dialogState = { type: 'TexItemEditDialog' }
      break
  }
}

/** ワークスペースダイアログを表示する */
export function showWorkspaceDialog() {
  External.instance.dialogState = { type: 'WorkspaceDialog' }
}

/** 他のトランスクルード元ダイアログを表示する */
export function showOtherParentsDialog() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (CurrentState.countParents(targetItemId) >= 2) {
    External.instance.dialogState = { type: 'OtherParentsDialog' }
  }
}

/** 検索ダイアログを表示する */
export function showSearchDialog() {
  External.instance.dialogState = { type: 'SearchDialog' }
}

/** 出典編集ダイアログを表示する */
export function showSourceEditDialog() {
  External.instance.dialogState = { type: 'SourceEditDialog' }
}

/** 独自コンテキストメニューを表示する */
export function showContextMenu() {
  External.instance.dialogState = { type: 'ContextMenu' }
}

export function showReplaceDialog() {
  External.instance.dialogState = { type: 'ReplaceDialog' }
}

export function showCommandPalette() {
  External.instance.dialogState = { type: 'CommandPalette' }
}

export function showExportDialog() {
  External.instance.dialogState = { type: 'ExportDialog' }
}
