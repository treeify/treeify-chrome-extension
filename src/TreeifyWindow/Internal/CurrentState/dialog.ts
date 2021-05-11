import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {
  CodeBlockItemEditDialog,
  DefaultWindowModeSettingDialog,
  WebPageItemTitleSettingDialog,
  WorkspaceDialog,
} from 'src/TreeifyWindow/Internal/State'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(value: WebPageItemTitleSettingDialog | null) {
  Internal.instance.state.webPageItemTitleSettingDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('webPageItemTitleSettingDialog'))
}

/** コードブロックアイテム編集ダイアログの状態を設定する */
export function setCodeBlockItemEditDialog(value: CodeBlockItemEditDialog | null) {
  Internal.instance.state.codeBlockItemEditDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItemEditDialog'))
}

/** デフォルトウィンドウモード設定ダイアログの状態を設定する */
export function setDefaultWindowModeSettingDialog(value: DefaultWindowModeSettingDialog | null) {
  Internal.instance.state.defaultWindowModeSettingDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('defaultWindowModeSettingDialog'))
}

/** ワークスペースダイアログの状態を設定する */
export function setWorkspaceDialog(value: WorkspaceDialog | null) {
  Internal.instance.state.workspaceDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('workspaceDialog'))
}
