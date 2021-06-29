import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {
  CitationSettingDialog,
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
  Internal.instance.mutate(value, PropertyPath.of('webPageItemTitleSettingDialog'))
}

/** コードブロックアイテム編集ダイアログの状態を設定する */
export function setCodeBlockItemEditDialog(value: CodeBlockItemEditDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('codeBlockItemEditDialog'))
}

/** TeX編集ダイアログの状態を設定する */
export function setTexEditDialog(value: TexEditDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('texEditDialog'))
}

/** デフォルトウィンドウモード設定ダイアログの状態を設定する */
export function setDefaultWindowModeSettingDialog(value: DefaultWindowModeSettingDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('defaultWindowModeSettingDialog'))
}

/** ワークスペースダイアログの状態を設定する */
export function setWorkspaceDialog(value: WorkspaceDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('workspaceDialog'))
}

/** ラベル編集ダイアログの状態を設定する */
export function setLabelEditDialog(value: LabelEditDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('labelEditDialog'))
}

/** 他のトランスクルード元ダイアログの状態を設定する */
export function setOtherParentsDialog(value: OtherParentsDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('otherParentsDialog'))
}

/** 検索ダイアログの状態を設定する */
export function setSearchDialog(value: SearchDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('searchDialog'))
}

/** 出典設定ダイアログの状態を設定する */
export function setCitationSettingDialog(value: CitationSettingDialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('citationSettingDialog'))
}
