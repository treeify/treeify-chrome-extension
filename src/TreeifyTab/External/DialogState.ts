import { DiscriminatedUnion, ItemId } from 'src/TreeifyTab/basicType'
import { Coordinate } from 'src/Utility/integer'

export type ContextMenuDialog = {
  mousePosition: Coordinate
}

export type TabsDialog = {
  // このダイアログは他と異なり専用のターゲット項目IDを持つ
  targetItemId: ItemId
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
  WebPageItemTitleSettingDialog: {}
  WorkspaceDialog: {}
}>
