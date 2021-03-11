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

export type RootViewModel = {
  leftSidebarViewMode: LeftSidebarViewModel
  itemTreeViewModel: ItemTreeViewModel
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewMode: {
      pageTreeViewModel: createPageTreeViewModel(state),
    },
    itemTreeViewModel: createItemTreeViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    ${LeftSidebarView(viewModel.leftSidebarViewMode)} ${ItemTreeView(viewModel.itemTreeViewModel)}
  </div>`
}
