import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createDataFolderPickerOpenButtonProps,
  DataFolderPickerOpenButtonProps,
} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {
  CodeBlockItemEditDialogProps,
  createCodeBlockItemEditDialogProps,
} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialogView'
import {
  createDefaultWindowModeSettingDialogProps,
  DefaultWindowModeSettingDialogProps,
} from 'src/TreeifyWindow/View/Dialog/DefaultWindowModeSettingDialogView'
import {
  createLabelEditDialogProps,
  LabelEditDialogProps,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createOtherParentsDialogProps,
  OtherParentsDialogProps,
} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogView'
import {
  createWebPageItemTitleSettingDialogProps,
  WebPageItemTitleSettingDialogProps,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogView'
import {
  createWorkspaceDialogProps,
  WorkspaceDialogProps,
} from 'src/TreeifyWindow/View/Dialog/WorkspaceDialogView'
import {createItemTreeProps, ItemTreeProps} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {
  createLeftSidebarProps,
  LeftSidebarProps,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'

export type RootProps = {
  leftSidebarProps: LeftSidebarProps | undefined
  itemTreeProps: ItemTreeProps
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogProps | undefined
  codeBlockItemEditDialogProps: CodeBlockItemEditDialogProps | undefined
  defaultWindowModeSettingDialog: DefaultWindowModeSettingDialogProps | undefined
  workspaceDialog: WorkspaceDialogProps | undefined
  labelEditDialog: LabelEditDialogProps | undefined
  otherParentsDialog: OtherParentsDialogProps | undefined
  dataFolderPickerOpenButtonProps: DataFolderPickerOpenButtonProps
}

export function createRootProps(state: State): RootProps {
  return {
    leftSidebarProps: createLeftSidebarProps(state),
    itemTreeProps: createItemTreeProps(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogProps(state),
    dataFolderPickerOpenButtonProps: createDataFolderPickerOpenButtonProps(),
    codeBlockItemEditDialogProps: createCodeBlockItemEditDialogProps(state),
    defaultWindowModeSettingDialog: createDefaultWindowModeSettingDialogProps(state),
    workspaceDialog: createWorkspaceDialogProps(state),
    labelEditDialog: createLabelEditDialogProps(state),
    otherParentsDialog: createOtherParentsDialogProps(state),
  }
}
