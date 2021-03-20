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
  onClickDeleteButton: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
  onDragOver: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
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
    onClickDeleteButton: (event) => {
      doWithErrorHandling(() => {
        const inputId = InputId.fromMouseEvent(event)
        switch (inputId) {
          case '0000MouseButton0':
            event.preventDefault()
            NextState.setTargetItemPath(itemPath)
            NullaryCommand.deleteItem()
            NextState.commit()
            break
          case '1000MouseButton0':
            event.preventDefault()
            NextState.setTargetItemPath(itemPath)
            NullaryCommand.deleteItemItself()
            NextState.commit()
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
        event.dataTransfer.setDragImage(domElement, 0, 0)

        event.dataTransfer.setData('application/treeify', JSON.stringify(itemPath.itemIds))
      })
    },
    onDragOver: (event) => {
      // ドロップを動作させるために必要
      event.preventDefault()
    },
    onDrop: (event) => {
      doWithErrorHandling(() => {
        if (event.dataTransfer === null || !(event.target instanceof HTMLElement)) return

        const data = event.dataTransfer.getData('application/treeify')
        const draggedItemPath = new ItemPath(List(JSON.parse(data)))

        // TODO: 循環チェックをしないと親子間でのドロップとかで壊れるぞ
        // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
        if (draggedItemPath.parentItemId === undefined) return

        NextState.removeItemGraphEdge(draggedItemPath.parentItemId, draggedItemPath.itemId)

        if (event.offsetY < event.target.offsetHeight / 2) {
          // ドロップ先座標がコンテンツ領域の上半分の場合
          NextState.insertPrevSiblingItem(itemPath, draggedItemPath.itemId)
        } else {
          // ドロップ先座標がコンテンツ領域の下半分の場合
          NextState.insertNextSiblingItem(itemPath, draggedItemPath.itemId)
        }

        NextState.updateItemTimestamp(draggedItemPath.itemId)
        NextState.commit()
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
  const childrenCssClasses = viewModel.cssClasses.map((cssClass) => cssClass + '-children')

  return html`<div class="item-tree-node">
    ${viewModel.isActivePage
      ? undefined
      : html`
          <!-- バレットとインデントラインの領域 -->
          <div
            class="item-tree-node_spool-area"
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
        <div
          class=${viewModel.cssClasses.unshift('item-tree-node_body-area').join(' ')}
          @dragover=${viewModel.onDragOver}
          @drop=${viewModel.onDrop}
        >
          <!-- コンテンツ領域 -->
          <div class="item-tree-node_content-area" @mousedown=${viewModel.onMouseDownContentArea}>
            ${ItemTreeContentView(viewModel.contentViewModel)}
          </div>
          <div class="item-tree-node_delete-button" @click=${viewModel.onClickDeleteButton}></div>
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
