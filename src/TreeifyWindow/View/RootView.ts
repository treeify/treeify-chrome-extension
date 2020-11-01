import {html, TemplateResult} from 'lit-html'
import {ItemTreeRootView, ItemTreeRootViewModel} from 'src/TreeifyWindow/View/ItemTreeRootView'

export type RootViewModel = {
  itemTreeRootViewModel: ItemTreeRootViewModel
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div>${ItemTreeRootView(viewModel.itemTreeRootViewModel)}</div>`
}
