import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {
  ItemTreeBulletView,
  ItemTreeBulletViewModel,
} from 'src/TreeifyWindow/View/ItemTreeBulletView'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'

export type ItemTreeNodeViewModel = {
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  bulletViewModel: ItemTreeBulletViewModel
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  // TODO: バレットを表示する
  // TODO: インデントラインを表示する
  return html`<div class="item-tree-node">
    <!-- バレットとインデントラインの領域 -->
    <div class="item-tree-node_bullet-and-indent-area">
      ${ItemTreeBulletView(viewModel.bulletViewModel)}
      <div class="item-tree-node_indent-area"></div>
    </div>
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
