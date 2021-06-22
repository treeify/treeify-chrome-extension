import {is, List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {
  createItemTreeContentProps,
  ItemTreeContentProps,
  ItemTreeContentView,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentProps'
import {
  createItemTreeSpoolProps,
  deriveBulletState,
  ItemTreeBulletState,
  ItemTreeSpoolProps,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeSpoolProps'

export type ItemTreeNodeProps = {
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
  contentProps: ItemTreeContentProps
  childItemPropses: List<ItemTreeNodeProps>
  spoolProps: ItemTreeSpoolProps
  onMouseDownContentArea: (event: MouseEvent) => void
  onClickDeleteButton: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
  onClickHiddenTabsCount: (event: MouseEvent) => void
}

// 再帰的にアイテムツリーのPropsを作る
export function createItemTreeNodeProps(
  state: State,
  footprintRankMap: Map<ItemId, integer>,
  footprintCount: integer,
  itemPath: ItemPath
): ItemTreeNodeProps {
  const itemId = ItemPath.getItemId(itemPath)
  const item = state.items[itemId]
  const displayingChildItemIds = CurrentState.getDisplayingChildItemIds(itemPath)

  return {
    itemPath,
    isActivePage: !ItemPath.hasParent(itemPath),
    selected: deriveSelected(state, itemPath),
    isTranscluded: Object.keys(item.parents).length > 1,
    cssClasses: item.cssClasses,
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenLoadedTabs(state, itemPath),
    spoolProps: createItemTreeSpoolProps(state, itemPath),
    contentProps: createItemTreeContentProps(state, itemPath, item.itemType),
    childItemPropses: displayingChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeProps(
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
          Rerenderer.instance.rerender()
        }
      })
    },
    onClickDeleteButton: (event) => {
      doWithErrorCapture(() => {
        Internal.instance.saveCurrentStateToUndoStack()

        CurrentState.setTargetItemPath(itemPath)

        const inputId = InputId.fromMouseEvent(event)
        const commands: List<Command> | undefined = state.itemTreeDeleteButtonMouseBinding[inputId]
        if (commands !== undefined) {
          event.preventDefault()
          for (const command of commands) {
            Command.execute(command)
          }
        }
        Rerenderer.instance.rerender()
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
      Rerenderer.instance.rerender()
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
    return CurrentState.countLoadedTabsInSubtree(state, itemId)
  } else {
    return CurrentState.countLoadedTabsInSubtree(state, itemId) - 1
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

  const childItemIds = state.items[parentItemId].childItemIds
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
