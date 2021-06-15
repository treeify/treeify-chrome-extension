import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createDataFolderPickerOpenButtonViewModel,
  DataFolderPickerOpenButtonViewModel,
} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {
  CodeBlockItemEditDialogViewModel,
  createCodeBlockItemEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialogView'
import {
  createDefaultWindowModeSettingDialogViewModel,
  DefaultWindowModeSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/DefaultWindowModeSettingDialogView'
import {
  createLabelEditDialogViewModel,
  LabelEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createOtherParentsDialogViewModel,
  OtherParentsDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogView'
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogView'
import {
  createWorkspaceDialogViewModel,
  WorkspaceDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WorkspaceDialogView'
import {
  createItemTreeViewModel,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {
  createLeftSidebarViewModel,
  LeftSidebarViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'

export type RootViewModel = {
  leftSidebarViewModel: LeftSidebarViewModel | undefined
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
  codeBlockItemEditDialogViewModel: CodeBlockItemEditDialogViewModel | undefined
  defaultWindowModeSettingDialog: DefaultWindowModeSettingDialogViewModel | undefined
  workspaceDialog: WorkspaceDialogViewModel | undefined
  labelEditDialog: LabelEditDialogViewModel | undefined
  otherParentsDialog: OtherParentsDialogViewModel | undefined
  dataFolderPickerOpenButtonViewModel: DataFolderPickerOpenButtonViewModel
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewModel: createLeftSidebarViewModel(state),
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
    dataFolderPickerOpenButtonViewModel: createDataFolderPickerOpenButtonViewModel(),
    codeBlockItemEditDialogViewModel: createCodeBlockItemEditDialogViewModel(state),
    defaultWindowModeSettingDialog: createDefaultWindowModeSettingDialogViewModel(state),
    workspaceDialog: createWorkspaceDialogViewModel(state),
    labelEditDialog: createLabelEditDialogViewModel(state),
    otherParentsDialog: createOtherParentsDialogViewModel(state),
  }
}
