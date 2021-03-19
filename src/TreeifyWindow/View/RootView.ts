import {html, TemplateResult} from 'lit-html'
import {State} from 'src/TreeifyWindow/Internal/State'
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
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogView,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'

export type RootViewModel = {
  leftSidebarViewModel: LeftSidebarViewModel | undefined
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewModel: createLeftSidebarViewModel(state),
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    <div class="sidebar-layout">
      ${viewModel.leftSidebarViewModel !== undefined
        ? LeftSidebarView(viewModel.leftSidebarViewModel)
        : undefined}
      ${ItemTreeView(viewModel.itemTreeViewModel)}
    </div>
    ${viewModel.webPageItemTitleSettingDialog !== undefined
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined}
  </div>`
}
