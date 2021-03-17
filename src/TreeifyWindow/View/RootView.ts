import {html, TemplateResult} from 'lit-html'
import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeViewModel,
  ItemTreeView,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {
  LeftSidebarView,
  LeftSidebarViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'
import {createPageTreeViewModel} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'
import {WebPageItemTitleSettingDialogView} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'

export type RootViewModel = {
  leftSidebarViewMode: LeftSidebarViewModel
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog | null
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewMode: {
      pageTreeViewModel: createPageTreeViewModel(state),
    },
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    <div class="sidebar-layout">
      ${LeftSidebarView(viewModel.leftSidebarViewMode)}${ItemTreeView(viewModel.itemTreeViewModel)}
    </div>
    ${viewModel.webPageItemTitleSettingDialog !== null
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined}
  </div>`
}
