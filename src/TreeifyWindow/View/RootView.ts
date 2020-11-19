import {html, TemplateResult} from 'lit-html'
import {ItemTreeRootView, ItemTreeRootViewModel} from 'src/TreeifyWindow/View/ItemTreeRootView'
import {
  LeftSidebarView,
  LeftSidebarViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'

export type RootViewModel = {
  leftSidebarViewMode: LeftSidebarViewModel
  itemTreeRootViewModel: ItemTreeRootViewModel
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    ${LeftSidebarView(viewModel.leftSidebarViewMode)}
    ${ItemTreeRootView(viewModel.itemTreeRootViewModel)}
  </div>`
}
