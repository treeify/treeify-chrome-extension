import {Coordinate} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyTab/basicType'

export type CaptionSettingDialog = {type: 'CaptionSettingDialog'}

export type CitationSettingDialog = {type: 'CitationSettingDialog'}

export type CodeBlockItemEditDialog = {type: 'CodeBlockItemEditDialog'}

export type ContextMenuDialog = {
  type: 'ContextMenuDialog'
  mousePosition: Coordinate
}

export type CustomCssDialog = {type: 'CustomCssDialog'}

export type ExportDialog = {type: 'ExportDialog'}

export type ImageItemEditDialog = {type: 'ImageItemEditDialog'}

export type ItemAdditionDropdownMenuDialog = {type: 'ItemAdditionDropdownMenuDialog'}

export type KeyBindingDialog = {type: 'KeyBindingDialog'}

export type OtherParentsDialog = {type: 'OtherParentsDialog'}

export type OtherSettingsDialog = {type: 'OtherSettingsDialog'}

export type PreferenceDropdownMenuDialog = {type: 'PreferenceDropdownMenuDialog'}

export type SearchDialog = {type: 'SearchDialog'}

export type TabsDialog = {
  type: 'TabsDialog'
  // このダイアログは他と異なり、専用のターゲット項目IDを持つので整合性に要注意。
  // 例えばこのダイアログを開いた状態でブラウザのタブを閉じて該当項目が削除された場合、
  // このプロパティは削除済みの項目を指すことになる。
  targetItemId: ItemId
}

export type TexEditDialog = {type: 'TexEditDialog'}

/** ウェブページ項目のタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  type: 'WebPageItemTitleSettingDialog'
  /** 対象となる項目のDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

export type WorkspaceDialog = {type: 'WorkspaceDialog'}

export type Dialog =
  | CaptionSettingDialog
  | CitationSettingDialog
  | CodeBlockItemEditDialog
  | ContextMenuDialog
  | CustomCssDialog
  | ImageItemEditDialog
  | ItemAdditionDropdownMenuDialog
  | ExportDialog
  | KeyBindingDialog
  | OtherParentsDialog
  | OtherSettingsDialog
  | PreferenceDropdownMenuDialog
  | SearchDialog
  | TabsDialog
  | TexEditDialog
  | WebPageItemTitleSettingDialog
  | WorkspaceDialog
