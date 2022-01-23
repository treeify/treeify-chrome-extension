import { ItemId } from 'src/TreeifyTab/basicType'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { Coordinate } from 'src/Utility/integer'

export type ContextMenuDialog = {
  mousePosition?: Coordinate
}

export type TabsDialog = {
  // このダイアログは他と異なり専用のターゲット項目IDを持つ
  targetItem: ItemId | ItemPath
}

export type DialogState = DiscriminatedUnion<{
  CaptionSettingDialog: {}
  SourceEditDialog: {}
  CodeBlockItemEditDialog: {}
  CodeBlockLanguageSettingDialog: {}
  CommandPaletteDialog: {}
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
  ReminderSettingDialog: {}
  ReplaceDialog: {}
  WebPageItemTitleSettingDialog: {}
  WorkspaceDialog: {}
}>
