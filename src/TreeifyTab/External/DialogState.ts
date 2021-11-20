import { Coordinate } from 'src/Common/integer'
import { DiscriminatedUnion, ItemId } from 'src/TreeifyTab/basicType'

export type CaptionSettingDialog = {}

export type CitationSettingDialog = {}

export type CodeBlockItemEditDialog = {}

export type CodeBlockLanguageSettingDialog = {}

export type ContextMenuDialog = {
  mousePosition: Coordinate
}

export type CustomCssDialog = {}

export type ExportDialog = {}

export type ImageItemEditDialog = {}

export type ItemAdditionDropdownMenuDialog = {}

export type KeyBindingDialog = {}

export type OtherParentsDialog = {}

export type OtherSettingsDialog = {}

export type PreferenceDropdownMenuDialog = {}

export type SearchDialog = {}

export type TabsDialog = {
  // このダイアログは他と異なり、専用のターゲット項目IDを持つので整合性に要注意。
  // 例えばこのダイアログを開いた状態でブラウザのタブを閉じて該当項目が削除された場合、
  // このプロパティは削除済みの項目を指すことになる。
  targetItemId: ItemId
}

export type TexEditDialog = {}

/** ウェブページ項目のタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  /** 対象となる項目のDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

export type WorkspaceDialog = {}

export type Dialog = DiscriminatedUnion<{
  CaptionSettingDialog: CaptionSettingDialog
  CitationSettingDialog: CitationSettingDialog
  CodeBlockItemEditDialog: CodeBlockItemEditDialog
  CodeBlockLanguageSettingDialog: CodeBlockLanguageSettingDialog
  ContextMenuDialog: ContextMenuDialog
  CustomCssDialog: CustomCssDialog
  ExportDialog: ExportDialog
  ImageItemEditDialog: ImageItemEditDialog
  ItemAdditionDropdownMenuDialog: ItemAdditionDropdownMenuDialog
  KeyBindingDialog: KeyBindingDialog
  OtherParentsDialog: OtherParentsDialog
  OtherSettingsDialog: OtherSettingsDialog
  PreferenceDropdownMenuDialog: PreferenceDropdownMenuDialog
  SearchDialog: SearchDialog
  TabsDialog: TabsDialog
  TexEditDialog: TexEditDialog
  WebPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  WorkspaceDialog: WorkspaceDialog
}>
