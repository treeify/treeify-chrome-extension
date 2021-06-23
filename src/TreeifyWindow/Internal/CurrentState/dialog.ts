import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {
  CodeBlockItemEditDialog,
  DefaultWindowModeSettingDialog,
  LabelEditDialog,
  OtherParentsDialog,
  SearchDialog,
  TexEditDialog,
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

/** TeX編集ダイアログの状態を設定する */
export function setTexEditDialog(value: TexEditDialog | null) {
  Internal.instance.state.texEditDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('texEditDialog'))
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

/** ラベル編集ダイアログの状態を設定する */
export function setLabelEditDialog(value: LabelEditDialog | null) {
  Internal.instance.state.labelEditDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('labelEditDialog'))
}

/** 他のトランスクルード元ダイアログの状態を設定する */
export function setOtherParentsDialog(value: OtherParentsDialog | null) {
  Internal.instance.state.otherParentsDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('otherParentsDialog'))
}

/** 検索ダイアログの状態を設定する */
export function setSearchDialog(value: SearchDialog | null) {
  Internal.instance.state.searchDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('searchDialog'))
}
