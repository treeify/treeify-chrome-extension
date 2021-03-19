import {html, TemplateResult} from 'lit-html'
import {State} from 'src/TreeifyWindow/Internal/State'
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
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogView,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'

export type RootViewModel = {
  leftSidebarViewModel: LeftSidebarViewModel
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewModel: {
      pageTreeViewModel: createPageTreeViewModel(state),
    },
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    <div class="sidebar-layout">
      ${LeftSidebarView(viewModel.leftSidebarViewModel)}${ItemTreeView(viewModel.itemTreeViewModel)}
    </div>
    ${viewModel.webPageItemTitleSettingDialog !== undefined
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined}
  </div>`
}
