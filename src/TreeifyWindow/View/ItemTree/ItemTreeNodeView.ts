import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat'
import {ItemId} from 'src/Common/basicType'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  createItemTreeContentViewModel,
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {
  createItemTreeSpoolViewModel,
  ItemTreeSpoolView,
  ItemTreeSpoolViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeSpoolView'

export type ItemTreeNodeViewModel = {
  itemPath: ItemPath
  isActivePage: boolean
  cssClasses: List<string>
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
  onMouseDownContentArea: (event: MouseEvent) => void
}

// 再帰的にアイテムツリーのViewModelを作る
export function createItemTreeNodeViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeNodeViewModel {
  const item = state.items[itemPath.itemId]
  const visibleChildItemIds = getVisibleChildItemIds(state, itemPath)

  return {
    itemPath,
    isActivePage: !itemPath.hasParent(),
    cssClasses: item.cssClasses,
    spoolViewModel: createItemTreeSpoolViewModel(state, itemPath, item),
    contentViewModel: createItemTreeContentViewModel(state, itemPath, item.itemType),
    childItemViewModels: visibleChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeViewModel(state, itemPath.createChildItemPath(childItemId))
    }),
    onMouseDownContentArea: (event: MouseEvent) => {
      const inputId = InputId.fromMouseEvent(event)
      if (inputId === '0000MouseButton1') {
        event.preventDefault()
        NextState.setFocusedItemPath(itemPath)
        NullaryCommand.deleteItem()
        NextState.commit()
      }
    },
  }
}

function getVisibleChildItemIds(state: State, itemPath: ItemPath): List<ItemId> {
  const item = state.items[itemPath.itemId]
  const isPage = state.pages[itemPath.itemId] !== undefined
  if (isPage) {
    return itemPath.hasParent() ? List.of() : item.childItemIds
  }
  return item.isFolded ? List.of() : item.childItemIds
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
    <div class="item-tree-node_content-and-children-area">
      <!-- コンテンツ領域 -->
      <div class="item-tree-node_content-area" @mousedown=${viewModel.onMouseDownContentArea}>
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
