import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'
import {ItemTreeSpoolView, ItemTreeSpoolViewModel} from 'src/TreeifyWindow/View/ItemTreeSpoolView'

export type ItemTreeNodeViewModel = {
  isActivePage: boolean
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
  onMouseDownContentArea: (event: MouseEvent) => void
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  return html`<div class="item-tree-node">
    ${viewModel.isActivePage
      ? undefined
      : html`
          <!-- バレットとインデントラインの領域 -->
          <div class="item-tree-node_spool-area">
            ${ItemTreeSpoolView(viewModel.spoolViewModel)}
          </div>
        `}
    <div class="item-tree-node-content-and-children-area">
      <!-- コンテンツ領域 -->
      <div class="item-tree-node-content-area" @mousedown=${viewModel.onMouseDownContentArea}>
        ${ItemTreeContentView(viewModel.contentViewModel)}
      </div>
      <!-- 子リスト領域 -->
      <div class="item-tree-node_children-area">
        ${viewModel.childItemViewModels.map(ItemTreeNodeView)}
      </div>
    </div>
  </div>`
}
