import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'

export type ItemTreeNodeViewModel = {
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  // TODO: バレットを表示する
  // TODO: インデントラインを表示する
  return html`<div class="item-tree-node">
    <!-- バレット領域 -->
    <div class="item-tree-node-bullet-area"></div>
    <!-- コンテンツ領域 -->
    <div class="item-tree-node-content-area">
      ${ItemTreeContentView(viewModel.contentViewModel)}
    </div>
    <!-- インデント領域 -->
    <div class="item-tree-node-indent-area"></div>
    <!-- 子リスト領域 -->
    <div class="item-tree-node-children-area">
      ${viewModel.childItemViewModels.map(ItemTreeNodeView)}
    </div>
  </div>`
}
