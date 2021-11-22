import { DiscriminatedUnion, ItemId } from 'src/TreeifyTab/basicType'
import { Coordinate } from 'src/Utility/integer'

export type ContextMenuDialog = {
  mousePosition: Coordinate
}

export type TabsDialog = {
  // このダイアログは他と異なり、専用のターゲット項目IDを持つので整合性に要注意。
  // 例えばこのダイアログを開いた状態でブラウザのタブを閉じて該当項目が削除された場合、
  // このプロパティは削除済みの項目を指すことになる。
  targetItemId: ItemId
}

/** ウェブページ項目のタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  /** 対象となる項目のDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

export type Dialog = DiscriminatedUnion<{
  CaptionSettingDialog: {}
  CitationSettingDialog: {}
  CodeBlockItemEditDialog: {}
  CodeBlockLanguageSettingDialog: {}
  ContextMenuDialog: ContextMenuDialog
  CustomCssDialog: {}
  ExportDialog: {}
  ImageItemEditDialog: {}
  ItemAdditionDropdownMenuDialog: {}
  KeyBindingDialog: {}
  OtherParentsDialog: {}
  OtherSettingsDialog: {}
  PreferenceDropdownMenuDialog: {}
  SearchDialog: {}
  TabsDialog: TabsDialog
  TexItemEditDialog: {}
  WebPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  WorkspaceDialog: {}
}>
