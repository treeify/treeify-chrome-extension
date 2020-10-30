import {TemplateResult} from 'lit-html'
import {ItemTreeNodeView, ItemTreeNodeViewModel} from 'src/TreeifyWindow/View/ItemTreeNodeView'

export type ItemTreeRootViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

/** アイテムツリーの全体のルートView */
export function ItemTreeRootView(viewModel: ItemTreeRootViewModel): TemplateResult {
  return ItemTreeNodeView(viewModel.rootNodeViewModel)
}
