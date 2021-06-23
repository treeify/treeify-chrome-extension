import {State} from 'src/TreeifyWindow/Internal/State'
import {
  CodeBlockItemEditDialogProps,
  createCodeBlockItemEditDialogProps,
} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialogProps'
import {
  createDefaultWindowModeSettingDialogProps,
  DefaultWindowModeSettingDialogProps,
} from 'src/TreeifyWindow/View/Dialog/DefaultWindowModeSettingDialogProps'
import {
  createLabelEditDialogProps,
  LabelEditDialogProps,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogProps'
import {
  createOtherParentsDialogProps,
  OtherParentsDialogProps,
} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogProps'
import {
  createSearchDialogProps,
  SearchDialogProps,
} from 'src/TreeifyWindow/View/Dialog/SearchDialogProps'
import {
  createTexEditDialogProps,
  TexEditDialogProps,
} from 'src/TreeifyWindow/View/Dialog/TexEditDialogProps'
import {
  createWebPageItemTitleSettingDialogProps,
  WebPageItemTitleSettingDialogProps,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogProps'
import {
  createWorkspaceDialogProps,
  WorkspaceDialogProps,
} from 'src/TreeifyWindow/View/Dialog/WorkspaceDialogProps'
import {createItemTreeProps, ItemTreeProps} from 'src/TreeifyWindow/View/ItemTree/ItemTreeProps'
import {
  createLeftSidebarProps,
  LeftSidebarProps,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarProps'
import {
  createDataFolderPickerOpenButtonProps,
  DataFolderPickerOpenButtonProps,
} from 'src/TreeifyWindow/View/Toolbar/DataFolderPickerOpenButtonProps'

export type RootProps = {
  leftSidebarProps: LeftSidebarProps | undefined
  itemTreeProps: ItemTreeProps
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogProps | undefined
  codeBlockItemEditDialogProps: CodeBlockItemEditDialogProps | undefined
  texEditDialogProps: TexEditDialogProps | undefined
  defaultWindowModeSettingDialog: DefaultWindowModeSettingDialogProps | undefined
  workspaceDialog: WorkspaceDialogProps | undefined
  labelEditDialog: LabelEditDialogProps | undefined
  otherParentsDialog: OtherParentsDialogProps | undefined
  searchDialog: SearchDialogProps | undefined
  dataFolderPickerOpenButtonProps: DataFolderPickerOpenButtonProps
}

export function createRootProps(state: State): RootProps {
  return {
    leftSidebarProps: createLeftSidebarProps(state),
    itemTreeProps: createItemTreeProps(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogProps(state),
    dataFolderPickerOpenButtonProps: createDataFolderPickerOpenButtonProps(),
    codeBlockItemEditDialogProps: createCodeBlockItemEditDialogProps(state),
    texEditDialogProps: createTexEditDialogProps(state),
    defaultWindowModeSettingDialog: createDefaultWindowModeSettingDialogProps(state),
    workspaceDialog: createWorkspaceDialogProps(state),
    labelEditDialog: createLabelEditDialogProps(state),
    otherParentsDialog: createOtherParentsDialogProps(state),
    searchDialog: createSearchDialogProps(state),
  }
}
