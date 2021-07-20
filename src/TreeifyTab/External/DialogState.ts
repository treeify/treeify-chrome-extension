import {Coordinate} from 'src/Common/integer'

export type CitationSettingDialog = {type: 'CitationSettingDialog'}

export type CodeBlockItemEditDialog = {type: 'CodeBlockItemEditDialog'}

export type ContextMenuDialog = {
  type: 'ContextMenuDialog'
  mousePosition: Coordinate
}

export type OtherParentsDialog = {type: 'OtherParentsDialog'}

export type PreferenceDialog = {type: 'PreferenceDialog'}

export type PreferenceDropdownMenuDialog = {type: 'PreferenceDropdownMenuDialog'}

export type SearchDialog = {type: 'SearchDialog'}

export type TexEditDialog = {type: 'TexEditDialog'}

/** ウェブページアイテムのタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  type: 'WebPageItemTitleSettingDialog'
  /** 対象となるアイテムのDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

export type WorkspaceDialog = {type: 'WorkspaceDialog'}

export type Dialog =
  | CitationSettingDialog
  | CodeBlockItemEditDialog
  | ContextMenuDialog
  | OtherParentsDialog
  | PreferenceDialog
  | PreferenceDropdownMenuDialog
  | SearchDialog
  | TexEditDialog
  | WebPageItemTitleSettingDialog
  | WorkspaceDialog
