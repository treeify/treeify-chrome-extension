import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(
  value: State.WebPageItemTitleSettingDialog | null
) {
  Internal.instance.state.webPageItemTitleSettingDialog.set(value)
  Internal.instance.markAsMutated(PropertyPath.of('webPageItemTitleSettingDialog'))
}

/** コードブロックアイテム編集ダイアログの状態を設定する */
export function setCodeBlockItemEditDialog(value: State.CodeBlockItemEditDialog | null) {
  Internal.instance.state.codeBlockItemEditDialog.set(value)
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItemEditDialog'))
}

/** デフォルトウィンドウモード設定ダイアログの状態を設定する */
export function setDefaultWindowModeSettingDialog(
  value: State.DefaultWindowModeSettingDialog | null
) {
  Internal.instance.state.defaultWindowModeSettingDialog.set(value)
  Internal.instance.markAsMutated(PropertyPath.of('defaultWindowModeSettingDialog'))
}

/** ワークスペースダイアログの状態を設定する */
export function setWorkspaceDialog(value: State.WorkspaceDialog | null) {
  Internal.instance.state.workspaceDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('workspaceDialog'))
}

/** ラベル編集ダイアログの状態を設定する */
export function setLabelEditDialog(value: State.LabelEditDialog | null) {
  Internal.instance.state.labelEditDialog.set(value)
  Internal.instance.markAsMutated(PropertyPath.of('labelEditDialog'))
}

/** 他のトランスクルード元ダイアログの状態を設定する */
export function setOtherParentsDialog(value: State.OtherParentsDialog | null) {
  Internal.instance.state.otherParentsDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('otherParentsDialog'))
}
