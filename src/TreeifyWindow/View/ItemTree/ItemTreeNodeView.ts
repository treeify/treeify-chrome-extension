import Color from 'color'
import {is, List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CssCustomProperty} from 'src/TreeifyWindow/CssCustomProperty'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {classMap, createDivElement} from 'src/TreeifyWindow/View/createElement'
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
import {get} from 'svelte/store'

export type ItemTreeNodeViewModel = {
  itemPath: ItemPath
  isActivePage: boolean
  /**
   * このアイテムが選択されているかどうかを示す値。
   * 複数選択されたアイテムのうちの1つならmulti。
   * 単一選択されたアイテムならsingle。
   * 選択されていないならnon。
   */
  selected: 'single' | 'multi' | 'non'
  isTranscluded: boolean
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
    selected: deriveSelected(state, itemPath),
    isTranscluded: Object.keys(item.parents).length > 1,
    cssClasses: get(item.cssClasses),
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenLoadedTabs(state, itemPath),
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
      doWithErrorCapture(() => {
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
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)

        const inputId = InputId.fromMouseEvent(event)
        const commands: List<Command> | undefined = state.itemTreeDeleteButtonMouseBinding[inputId]
        if (commands !== undefined) {
          event.preventDefault()
          for (const command of commands) {
            Command.execute(command)
          }
        }
        CurrentState.commit()
      })
    },
    onDragStart: (event) => {
      doWithErrorCapture(() => {
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

function countHiddenLoadedTabs(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  switch (bulletState) {
    case ItemTreeBulletState.NO_CHILDREN:
    case ItemTreeBulletState.EXPANDED:
    case ItemTreeBulletState.PAGE:
      return 0
    case ItemTreeBulletState.COLLAPSED:
      return countLoadedTabsInDescendants(state, ItemPath.getItemId(itemPath))
    default:
      assertNeverType(bulletState)
  }
}

// 指定されたアイテムの子孫アイテムに対応するロード状態のタブを数える。
// 自分自身に対応するタブはカウントしない。
// ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
function countLoadedTabsInDescendants(state: State, itemId: ItemId): integer {
  if (External.instance.tabItemCorrespondence.isUnloaded(itemId)) {
    return countLoadedTabsInSubtree(state, itemId)
  } else {
    return countLoadedTabsInSubtree(state, itemId) - 1
  }
}

// 指定されたアイテムのサブツリーに対応するロード状態のタブを数える。
// ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
function countLoadedTabsInSubtree(state: State, itemId: ItemId): integer {
  if (CurrentState.isPage(itemId)) {
    if (External.instance.tabItemCorrespondence.isUnloaded(itemId)) {
      return 0
    } else {
      return 1
    }
  }

  const sum = get(Internal.instance.state.items[itemId].childItemIds)
    .map((childItemId) => countLoadedTabsInSubtree(state, childItemId))
    .reduce((a: integer, x) => a + x, 0)
  if (External.instance.tabItemCorrespondence.isUnloaded(itemId)) {
    return sum
  } else {
    return 1 + sum
  }
}

function deriveSelected(state: State, itemPath: ItemPath): 'single' | 'multi' | 'non' {
  const targetItemPath = state.pages[CurrentState.getActivePageId()].targetItemPath
  const anchorItemPath = state.pages[CurrentState.getActivePageId()].anchorItemPath
  if (is(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    if (is(itemPath, targetItemPath)) return 'single'
    else return 'non'
  }

  if (!is(itemPath.pop(), targetItemPath.pop())) {
    // 選択されたアイテムパス群がこのアイテムパスと異なる子リスト上に存在する場合
    return 'non'
  }

  const targetItemId = ItemPath.getItemId(targetItemPath)
  const anchorItemId = ItemPath.getItemId(anchorItemPath)

  const parentItemId = ItemPath.getParentItemId(itemPath)
  // itemPathが親を持たない場合、複数選択に含まれることはないので必ずnonになる
  if (parentItemId === undefined) return 'non'

  const childItemIds = get(state.items[parentItemId].childItemIds)
  const targetItemIndex = childItemIds.indexOf(targetItemId)
  const anchorItemIndex = childItemIds.indexOf(anchorItemId)
  const itemIndex = childItemIds.indexOf(ItemPath.getItemId(itemPath))
  const minIndex = Math.min(targetItemIndex, anchorItemIndex)
  const maxIndex = Math.max(targetItemIndex, anchorItemIndex)
  if (minIndex <= itemIndex && itemIndex <= maxIndex) {
    return 'multi'
  } else {
    return 'non'
  }
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): HTMLElement {
  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const footprintLayerStyle =
    footprintColor !== undefined ? `background-color: ${footprintColor}` : ''
  const childrenCssClasses = viewModel.cssClasses.map((cssClass) => cssClass + '-children')

  return createDivElement(
    classMap({
      'item-tree-node': true,
      'multi-selected': viewModel.selected === 'multi',
    }),
    {},
    [
      viewModel.isActivePage
        ? createDivElement('grid-empty-cell')
        : createDivElement(
            {
              class: classMap({
                'item-tree-node_spool-area': true,
                transcluded: viewModel.isTranscluded,
                ...Object.fromEntries(viewModel.cssClasses.map((cssClass) => [cssClass, true])),
              }),
              draggable: 'true',
            },
            {dragstart: viewModel.onDragStart},
            [ItemTreeSpoolView(viewModel.spoolViewModel)]
          ),
      createDivElement('item-tree-node_body-and-children-area', {}, [
        // ボディ領域
        createDivElement(viewModel.cssClasses.unshift('item-tree-node_body-area').join(' '), {}, [
          // 足跡表示用のレイヤー
          createDivElement(
            {class: 'item-tree-node_footprint-layer', style: footprintLayerStyle},
            {},
            [
              // コンテンツ領域
              createDivElement(
                {
                  class: classMap({
                    'item-tree-node_content-area': true,
                    'single-selected': viewModel.selected === 'single',
                  }),
                  'data-item-path': JSON.stringify(viewModel.itemPath.toArray()),
                },
                {mousedown: viewModel.onMouseDownContentArea},
                [ItemTreeContentView(viewModel.contentViewModel)]
              ),
            ]
          ),
          // 隠れているタブ数
          viewModel.hiddenTabsCount > 0
            ? createDivElement(
                'item-tree-node_hidden-tabs-count',
                {click: viewModel.onClickHiddenTabsCount},
                Math.min(99, viewModel.hiddenTabsCount).toString()
              )
            : createDivElement('grid-empty-cell'),
          // 削除ボタン
          createDivElement('item-tree-node_delete-button', {click: viewModel.onClickDeleteButton}, [
            createDivElement('item-tree-node_delete-button-icon'),
          ]),
        ]),
        // 子リスト領域
        createDivElement(
          childrenCssClasses.unshift('item-tree-node_children-area').join(' '),
          {},
          viewModel.childItemViewModels.map((itemViewModel) => ItemTreeNodeView(itemViewModel))
        ),
      ]),
    ]
  )
}

function calculateFootprintColor(
  footprintRank: integer | undefined,
  footprintCount: integer
): Color | undefined {
  if (footprintRank === undefined) return undefined

  const strongestColor = CssCustomProperty.getColor('--item-tree-strongest-footprint-color')
  const weakestColor = CssCustomProperty.getColor('--item-tree-weakest-footprint-color')

  if (footprintCount === 1) {
    return strongestColor
  }

  // 線形補間する
  const ratio = footprintRank / (footprintCount - 1)
  return strongestColor.mix(weakestColor, ratio)
}
