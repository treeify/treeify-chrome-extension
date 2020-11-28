import {html, TemplateResult} from 'lit-html'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  createItemTreeRootViewModel,
  ItemTreeRootView,
  ItemTreeRootViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeRootView'
import {
  LeftSidebarView,
  LeftSidebarViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'
import {createPageTreeViewModel} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'

export type RootViewModel = {
  leftSidebarViewMode: LeftSidebarViewModel
  itemTreeRootViewModel: ItemTreeRootViewModel
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewMode: {
      pageTreeViewModel: createPageTreeViewModel(state),
    },
    itemTreeRootViewModel: createItemTreeRootViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    ${LeftSidebarView(viewModel.leftSidebarViewMode)}
    ${ItemTreeRootView(viewModel.itemTreeRootViewModel)}
  </div>`
}
