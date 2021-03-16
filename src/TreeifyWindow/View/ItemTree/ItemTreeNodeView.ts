import Color from 'color'
import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat'
import {styleMap} from 'lit-html/directives/style-map'
import {integer, ItemId} from 'src/Common/basicType'
import {CssCustomProperty} from 'src/Common/CssCustomProperty'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
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
import {doWithErrorHandling} from 'src/Common/Debug/report'

export type ItemTreeNodeViewModel = {
  itemPath: ItemPath
  isActivePage: boolean
  cssClasses: List<string>
  footprintRank: integer | undefined
  footprintCount: integer
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
  onMouseDownContentArea: (event: MouseEvent) => void
}

// 再帰的にアイテムツリーのViewModelを作る
export function createItemTreeNodeViewModel(
  state: State,
  footprintRankMap: Map<ItemId, integer>,
  footprintCount: integer,
  itemPath: ItemPath
): ItemTreeNodeViewModel {
  const item = state.items[itemPath.itemId]
  const visibleChildItemIds = getVisibleChildItemIds(state, itemPath)

  return {
    itemPath,
    isActivePage: !itemPath.hasParent(),
    cssClasses: item.cssClasses,
    footprintRank: footprintRankMap.get(item.itemId),
    footprintCount: footprintCount,
    spoolViewModel: createItemTreeSpoolViewModel(state, itemPath, item),
    contentViewModel: createItemTreeContentViewModel(state, itemPath, item.itemType),
    childItemViewModels: visibleChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeViewModel(
        state,
        footprintRankMap,
        footprintCount,
        itemPath.createChildItemPath(childItemId)
      )
    }),
    onMouseDownContentArea: (event: MouseEvent) => {
      doWithErrorHandling(() => {
        const inputId = InputId.fromMouseEvent(event)
        if (inputId === '0000MouseButton1') {
          event.preventDefault()
          NextState.setTargetItemPath(itemPath)
          NullaryCommand.deleteItem()
          NextState.commit()
        }
      })
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
  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const contentAreaStyle = styleMap({
    backgroundColor: footprintColor?.toString() ?? '',
  })

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
      <!-- 足跡表示用のレイヤー -->
      <div class="item-tree-node_footprint-layer" style=${contentAreaStyle}>
        <!-- コンテンツ領域 -->
        <div class="item-tree-node_content-area" @mousedown=${viewModel.onMouseDownContentArea}>
          ${ItemTreeContentView(viewModel.contentViewModel)}
        </div>
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

function calculateFootprintColor(
  footprintRank: integer | undefined,
  footprintCount: integer
): Color | undefined {
  if (footprintRank === undefined) return undefined

  const strongestColor = CssCustomProperty.getColor('--strongest-footprint-color')
  const weakestColor = CssCustomProperty.getColor('--weakest-footprint-color')

  if (footprintCount === 1) {
    return strongestColor
  }

  // 線形補間する
  const ratio = footprintRank / (footprintCount - 1)
  return strongestColor.mix(weakestColor, ratio)
}
