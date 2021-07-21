import {Coordinate} from 'src/Common/integer'

export type CitationSettingDialog = {type: 'CitationSettingDialog'}

export type CodeBlockItemEditDialog = {type: 'CodeBlockItemEditDialog'}

export type ContextMenuDialog = {
  type: 'ContextMenuDialog'
  mousePosition: Coordinate
}

export type CustomCssDialog = {type: 'CustomCssDialog'}

export type KeyBindingDialog = {type: 'KeyBindingDialog'}

export type OtherParentsDialog = {type: 'OtherParentsDialog'}

export type PreferenceDropdownMenuDialog = {type: 'PreferenceDropdownMenuDialog'}

export type SearchDialog = {type: 'SearchDialog'}

export type TexEditDialog = {type: 'TexEditDialog'}

/** ウェブページ項目のタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  type: 'WebPageItemTitleSettingDialog'
  /** 対象となる項目のDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

export type WorkspaceDialog = {type: 'WorkspaceDialog'}

export type Dialog =
  | CitationSettingDialog
  | CodeBlockItemEditDialog
  | ContextMenuDialog
  | CustomCssDialog
  | KeyBindingDialog
  | OtherParentsDialog
  | PreferenceDropdownMenuDialog
  | SearchDialog
  | TexEditDialog
  | WebPageItemTitleSettingDialog
  | WorkspaceDialog
