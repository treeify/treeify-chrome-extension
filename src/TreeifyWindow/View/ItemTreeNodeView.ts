import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'
import {ItemTreeSpoolView, ItemTreeSpoolViewModel} from 'src/TreeifyWindow/View/ItemTreeSpoolView'

export type ItemTreeNodeViewModel = {
  itemPath: ItemPath
  isActivePage: boolean
  cssClasses: List<string>
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
  onMouseDownContentArea: (event: MouseEvent) => void
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  return html`<div class=${viewModel.cssClasses.unshift('item-tree-node').join(' ')}>
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
        ${repeat(
          viewModel.childItemViewModels,
          (itemViewModel) => itemViewModel.itemPath.toString(),
          ItemTreeNodeView
        )}
      </div>
    </div>
  </div>`
}
