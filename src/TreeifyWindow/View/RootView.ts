import {List} from 'immutable'
import {TOP_ITEM_ID} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {toOpmlString} from 'src/TreeifyWindow/Internal/importAndExport'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createButtonElement, createDivElement} from 'src/TreeifyWindow/View/createElement'
import {
  createDataFolderPickerOpenButtonViewModel,
  DataFolderPickerOpenButtonView,
  DataFolderPickerOpenButtonViewModel,
} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {
  CodeBlockItemEditDialogView,
  CodeBlockItemEditDialogViewModel,
  createCodeBlockItemEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialogView'
import {
  createDefaultWindowModeSettingDialogViewModel,
  DefaultWindowModeSettingDialogView,
  DefaultWindowModeSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/DefaultWindowModeSettingDialogView'
import {
  createLabelEditDialogViewModel,
  LabelEditDialogView,
  LabelEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createOtherParentsDialogViewModel,
  OtherParentsDialogView,
  OtherParentsDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogView'
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogView,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogView'
import {
  createWorkspaceDialogViewModel,
  WorkspaceDialogView,
  WorkspaceDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WorkspaceDialogView'
import {FullWindowModeButtonView} from 'src/TreeifyWindow/View/FullWindowModeButtonView'
import {
  createItemTreeViewModel,
  ItemTreeView,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {
  createLeftSidebarViewModel,
  LeftSidebarView,
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

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel) {
  return createDivElement('root', {}, [
    createDivElement('toolbar-and-sidebar-layout', {}, [
      createDivElement('toolbar', {}, [
        createButtonElement({}, {click: onClickExportButton}, 'OPMLファイルをエクスポート'),
        FullWindowModeButtonView(),
        DataFolderPickerOpenButtonView(viewModel.dataFolderPickerOpenButtonViewModel),
      ]),
      createDivElement('sidebar-layout', {}, [
        viewModel.leftSidebarViewModel !== undefined
          ? LeftSidebarView(viewModel.leftSidebarViewModel)
          : createDivElement('grid-empty-cell'),
        ItemTreeView(viewModel.itemTreeViewModel),
      ]),
    ]),
    viewModel.webPageItemTitleSettingDialog !== undefined
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined,
    viewModel.codeBlockItemEditDialogViewModel !== undefined
      ? CodeBlockItemEditDialogView(viewModel.codeBlockItemEditDialogViewModel)
      : undefined,
    viewModel.defaultWindowModeSettingDialog !== undefined
      ? DefaultWindowModeSettingDialogView(viewModel.defaultWindowModeSettingDialog)
      : undefined,
    viewModel.workspaceDialog !== undefined
      ? WorkspaceDialogView(viewModel.workspaceDialog)
      : undefined,
    viewModel.labelEditDialog !== undefined
      ? LabelEditDialogView(viewModel.labelEditDialog)
      : undefined,
    viewModel.otherParentsDialog !== undefined
      ? OtherParentsDialogView(viewModel.otherParentsDialog)
      : undefined,
  ])
}

function onClickExportButton() {
  doWithErrorCapture(() => {
    const fileName = 'treeify.opml'

    const content = toOpmlString(List.of(List.of(TOP_ITEM_ID)))
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
    aElement.download = fileName
    aElement.click()
  })
}
