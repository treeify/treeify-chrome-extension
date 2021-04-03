import Color from 'color'
import {is, List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {repeat} from 'lit-html/directives/repeat'
import {styleMap} from 'lit-html/directives/style-map'
import {integer, ItemId} from 'src/Common/basicType'
import {CssCustomProperty} from 'src/Common/CssCustomProperty'
import {assertNeverType} from 'src/Common/Debug/assert'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeContentViewModel,
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {
  createItemTreeSpoolViewModel,
  deriveBulletState,
  ItemTreeBulletState,
  ItemTreeSpoolView,
  ItemTreeSpoolViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeSpoolView'

export type ItemTreeNodeViewModel = {
  itemPath: ItemPath
  isActivePage: boolean
  isSelected: boolean
  cssClasses: List<string>
  footprintRank: integer | undefined
  footprintCount: integer
  hiddenTabsCount: integer
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
  spoolViewModel: ItemTreeSpoolViewModel
  onMouseDownContentArea: (event: MouseEvent) => void
  onClickDeleteButton: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
  onClickHiddenTabsCount: (event: MouseEvent) => void
}

// 再帰的にアイテムツリーのViewModelを作る
export function createItemTreeNodeViewModel(
  state: State,
  footprintRankMap: Map<ItemId, integer>,
  footprintCount: integer,
  itemPath: ItemPath
): ItemTreeNodeViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  const item = state.items[itemId]
  const displayingChildItemIds = CurrentState.getDisplayingChildItemIds(itemPath)

  return {
    itemPath,
    isActivePage: !ItemPath.hasParent(itemPath),
    isSelected: deriveIsSelected(state, itemPath),
    cssClasses: item.cssClasses,
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenTabs(state, itemPath),
    spoolViewModel: createItemTreeSpoolViewModel(state, itemPath),
    contentViewModel: createItemTreeContentViewModel(state, itemPath, item.itemType),
    childItemViewModels: displayingChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeViewModel(
        state,
        footprintRankMap,
        footprintCount,
        itemPath.push(childItemId)
      )
    }),
    onMouseDownContentArea: (event: MouseEvent) => {
      doWithErrorHandling(() => {
        const inputId = InputId.fromMouseEvent(event)
        if (inputId === '0000MouseButton1') {
          event.preventDefault()
          CurrentState.setTargetItemPath(itemPath)
          NullaryCommand.deleteItem()
          CurrentState.commit()
        }
      })
    },
    onClickDeleteButton: (event) => {
      doWithErrorHandling(() => {
        const inputId = InputId.fromMouseEvent(event)
        switch (inputId) {
          case '0000MouseButton0':
            event.preventDefault()
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.deleteItem()
            CurrentState.commit()
            break
          case '1000MouseButton0':
            event.preventDefault()
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.deleteItemItself()
            CurrentState.commit()
            break
        }
      })
    },
    onDragStart: (event) => {
      doWithErrorHandling(() => {
        if (event.dataTransfer === null) return

        const domElementId = ItemTreeContentView.focusableDomElementId(itemPath)
        const domElement = document.getElementById(domElementId)
        if (domElement === null) return
        // ドラッグ中にマウスポインターに追随して表示される内容を設定
        event.dataTransfer.setDragImage(domElement, 0, domElement.offsetHeight / 2)

        event.dataTransfer.setData('application/treeify', JSON.stringify(itemPath))
      })
    },
    onClickHiddenTabsCount: (event: MouseEvent) => {
      CurrentState.setTargetItemPath(itemPath)
      NullaryCommand.hardUnloadSubtree()
      CurrentState.commit()
    },
  }
}

function countHiddenTabs(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  switch (bulletState) {
    case ItemTreeBulletState.NO_CHILDREN:
    case ItemTreeBulletState.EXPANDED:
    case ItemTreeBulletState.PAGE:
      return 0
    case ItemTreeBulletState.COLLAPSED:
      return countTabsInDescendants(state, ItemPath.getItemId(itemPath))
    default:
      assertNeverType(bulletState)
  }
}

// 指定されたアイテムの子孫アイテムに対応するタブの数を数える（自分自身に対応するタブはカウントしない）。
// ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
function countTabsInDescendants(state: State, itemId: ItemId): integer {
  if (External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined) {
    return countTabsInSubtree(state, itemId) - 1
  } else {
    return countTabsInSubtree(state, itemId)
  }
}

// 指定されたアイテムのサブツリーに対応するタブの数を数える。
// ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
function countTabsInSubtree(state: State, itemId: ItemId): integer {
  if (CurrentState.isPage(itemId)) {
    if (External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined) {
      return 1
    } else {
      return 0
    }
  }

  const sum = Internal.instance.state.items[itemId].childItemIds
    .map((childItemId) => countTabsInSubtree(state, childItemId))
    .reduce((a: integer, x) => a + x, 0)
  if (External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined) {
    return 1 + sum
  } else {
    return sum
  }
}

function deriveIsSelected(state: State, itemPath: ItemPath): boolean {
  const targetItemPath = state.pages[state.activePageId].targetItemPath
  const anchorItemPath = state.pages[state.activePageId].anchorItemPath
  if (is(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    return false
  }

  if (!is(itemPath.pop(), targetItemPath.pop())) {
    // 選択されたアイテムパス群がこのアイテムパスと異なる子リスト上に存在する場合
    return false
  }

  const targetItemId = ItemPath.getItemId(targetItemPath)
  const anchorItemId = ItemPath.getItemId(anchorItemPath)

  const parentItemId = ItemPath.getParentItemId(itemPath)
  if (parentItemId === undefined) return false
  const childItemIds = state.items[parentItemId].childItemIds
  const targetItemIndex = childItemIds.indexOf(targetItemId)
  const anchorItemIndex = childItemIds.indexOf(anchorItemId)
  const itemIndex = childItemIds.indexOf(ItemPath.getItemId(itemPath))
  const minIndex = Math.min(targetItemIndex, anchorItemIndex)
  const maxIndex = Math.max(targetItemIndex, anchorItemIndex)
  return minIndex <= itemIndex && itemIndex <= maxIndex
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const contentAreaStyle = styleMap({
    backgroundColor: footprintColor?.toString() ?? '',
  })
  const childrenCssClasses = viewModel.cssClasses.map((cssClass) => cssClass + '-children')

  return html`<div class=${classMap({'item-tree-node': true, selected: viewModel.isSelected})}>
    ${viewModel.isActivePage
      ? undefined
      : html`
          <!-- バレットとインデントラインの領域 -->
          <div
            class=${viewModel.cssClasses.unshift('item-tree-node_spool-area').join(' ')}
            draggable="true"
            @dragstart=${viewModel.onDragStart}
          >
            ${ItemTreeSpoolView(viewModel.spoolViewModel)}
          </div>
        `}
    <div class="item-tree-node_body-and-children-area">
      <!-- 足跡表示用のレイヤー -->
      <div class="item-tree-node_footprint-layer" style=${contentAreaStyle}>
        <!-- ボディ領域 -->
        <div class=${viewModel.cssClasses.unshift('item-tree-node_body-area').join(' ')}>
          <!-- コンテンツ領域 -->
          <div
            data-item-path=${JSON.stringify(viewModel.itemPath.toArray())}
            class="item-tree-node_content-area"
            @mousedown=${viewModel.onMouseDownContentArea}
          >
            ${ItemTreeContentView(viewModel.contentViewModel)}
          </div>
          <!-- 隠れているタブ数 -->
          ${viewModel.hiddenTabsCount > 0
            ? html`<div
                class="item-tree-node_hidden-tabs-count"
                @click=${viewModel.onClickHiddenTabsCount}
              >
                ${Math.min(99, viewModel.hiddenTabsCount)}
              </div>`
            : undefined}
          <!-- 削除ボタン -->
          <div class="item-tree-node_delete-button" @click=${viewModel.onClickDeleteButton}>
            <div class="item-tree-node_delete-button-icon"></div>
          </div>
        </div>
      </div>
      <!-- 子リスト領域 -->
      <div class=${childrenCssClasses.unshift('item-tree-node_children-area').join(' ')}>
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
