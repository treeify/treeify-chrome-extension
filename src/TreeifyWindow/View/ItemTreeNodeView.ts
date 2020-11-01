import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'
import {ItemTreeSpoolView, ItemTreeSpoolViewModel} from 'src/TreeifyWindow/View/ItemTreeSpoolView'

export type ItemTreeNodeViewModel = {
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  return html`<div class="item-tree-node">
    <!-- バレットとインデントラインの領域 -->
    <div class="item-tree-node_spool-area">${ItemTreeSpoolView(viewModel.spoolViewModel)}</div>
    <!-- コンテンツ領域 -->
    <div class="item-tree-node-content-area">
      ${ItemTreeContentView(viewModel.contentViewModel)}
    </div>
    <!-- 子リスト領域 -->
    <div class="item-tree-node_children-area">
      ${viewModel.childItemViewModels.map(ItemTreeNodeView)}
    </div>
  </div>`
}
