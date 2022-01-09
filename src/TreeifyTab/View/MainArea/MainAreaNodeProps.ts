import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import {
  createMainAreaContentProps,
  MainAreaContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import {
  createMainAreaRollProps,
  deriveBulletState,
  MainAreaBulletState,
  MainAreaRollProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaRollProps'
import { assertNeverType } from 'src/Utility/Debug/assert'
import { RArray, RArray$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type MainAreaNodeProps = {
  itemPath: ItemPath
  isActivePage: boolean
  /**
   * この項目が選択されているかどうかを示す値。
   * 複数選択された項目のうちの1つならmulti。
   * 単一選択された項目ならsingle。
   * 選択されていないならnon。
   */
  selected: 'single' | 'multi' | 'non'
  isTranscluded: boolean
  isExcluded: boolean
  cssClasses: RArray<string>
  footprintRank: integer | undefined
  footprintCount: integer
  hiddenTabsCount: integer
  contentProps: MainAreaContentProps
  childItemPropses: RArray<MainAreaNodeProps>
  rollProps: MainAreaRollProps
  onMouseDownContentArea(event: MouseEvent): void
  onContextMenu(event: Event): void
  onClickDeleteButton(event: MouseEvent): void
  onClickHiddenTabsCount(event: MouseEvent): void
}

export function createMainAreaNodeProps(
  state: State,
  footprintRankMap: Map<ItemId, integer>,
  footprintCount: integer,
  itemPath: ItemPath
): MainAreaNodeProps {
  const itemId = ItemPath.getItemId(itemPath)
  const item = state.items[itemId]
  const displayingChildItemIds = CurrentState.getDisplayingChildItemIds(itemPath).toArray()

  return {
    itemPath,
    isActivePage: !ItemPath.hasParent(itemPath),
    selected: deriveSelected(state, itemPath),
    isTranscluded: Object.keys(item.parents).length > 1,
    isExcluded: CurrentState.getExcludedItemIds().includes(itemId),
    cssClasses:
      item.source === null ? item.cssClasses : RArray$.append('has-source')(item.cssClasses),
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenTabs(state, itemPath),
    rollProps: createMainAreaRollProps(state, itemPath),
    contentProps: createMainAreaContentProps(state, itemPath, item.type),
    childItemPropses: displayingChildItemIds.map((childItemId: ItemId) => {
      return createMainAreaNodeProps(
        state,
        footprintRankMap,
        footprintCount,
        RArray$.append(childItemId)(itemPath)
      )
    }),
    onMouseDownContentArea(event: MouseEvent) {
      switch (InputId.fromMouseEvent(event)) {
        case '0100MouseButton0':
          const targetItemPath = CurrentState.getTargetItemPath()
          // テキスト選択をさせるためにブラウザのデフォルトの挙動に任せる
          if (RArray$.shallowEqual(itemPath, targetItemPath)) break

          event.preventDefault()

          // 同じ兄弟リストに降りてくるまでtargetとanchorの両方をカットする
          const commonPrefix = ItemPath.getCommonPrefix(itemPath, targetItemPath)
          const targetCandidate = RArray$.takeLeft(commonPrefix.length + 1)(itemPath)
          const anchorCandidate = RArray$.takeLeft(commonPrefix.length + 1)(targetItemPath)
          if (targetCandidate.length === anchorCandidate.length) {
            CurrentState.setTargetItemPathOnly(targetCandidate)
            CurrentState.setAnchorItemPath(anchorCandidate)
            Rerenderer.instance.requestToFocusTargetItem()
            Rerenderer.instance.rerender()
          }
          break
        case '0000MouseButton1':
        case '1000MouseButton2':
          event.preventDefault()
          Internal.instance.saveCurrentStateToUndoStack()
          CurrentState.setTargetItemPath(itemPath)
          Command.removeItem()
          Rerenderer.instance.rerender()
          break
        case '1000MouseButton1':
          event.preventDefault()
          Internal.instance.saveCurrentStateToUndoStack()
          CurrentState.setTargetItemPath(itemPath)
          Command.deleteJustOneItem()
          Rerenderer.instance.rerender()
          break
        case '0000MouseButton2':
          // 複数選択中に選択範囲内を右クリックした場合はtargetItemPathを更新せず、
          // その複数選択された項目をコンテキストメニューの操作対象にする。
          if (
            CurrentState.getSelectedItemPaths().length === 1 ||
            !CurrentState.isInSubtreeOfSelectedItemPaths(itemPath)
          ) {
            CurrentState.setTargetItemPath(itemPath)
          }
          break
        default:
          CurrentState.setTargetItemPath(itemPath)
          Rerenderer.instance.rerender()
          break
      }
    },
    onContextMenu(event: Event) {
      // テキスト選択中はブラウザ標準のコンテキストメニューを表示する
      if (getSelection()?.isCollapsed === false) return

      if (event instanceof MouseEvent) {
        // 独自コンテキストメニューを表示
        event.preventDefault()

        if (InputId.fromMouseEvent(event) !== '0000MouseButton2') return

        External.instance.dialogState = {
          type: 'ContextMenuDialog',
          mousePosition: { x: event.clientX, y: event.clientY },
        }
        Rerenderer.instance.rerender()
      }
    },
    onClickDeleteButton(event) {
      Internal.instance.saveCurrentStateToUndoStack()

      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (inputId) {
        case '0000MouseButton0':
          event.preventDefault()
          Command.removeItem()
          Rerenderer.instance.rerender()
          break
        case '1000MouseButton0':
          event.preventDefault()
          Command.deleteJustOneItem()
          Rerenderer.instance.rerender()
          break
      }
    },
    onClickHiddenTabsCount(event: MouseEvent) {
      switch (InputId.fromMouseEvent(event)) {
        case '0000MouseButton0':
          CurrentState.setTargetItemPath(itemPath)
          Command.closeTreeTabs()
          Rerenderer.instance.rerender()
          break
      }
    },
  }
}

function countHiddenTabs(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  switch (bulletState) {
    case MainAreaBulletState.NO_CHILDREN:
    case MainAreaBulletState.UNFOLDED:
    case MainAreaBulletState.PAGE:
      return 0
    case MainAreaBulletState.FOLDED:
      return countTabsInDescendants(state, ItemPath.getItemId(itemPath))
    default:
      assertNeverType(bulletState)
  }
}

// 指定された項目の子孫項目に対応するタブを数える。
// 自分自身に対応するタブはカウントしない。
// ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
function countTabsInDescendants(state: State, itemId: ItemId): integer {
  if (External.instance.tabItemCorrespondence.getTabIdBy(itemId) === undefined) {
    return CurrentState.countTabsInSubtree(state, itemId)
  } else {
    return CurrentState.countTabsInSubtree(state, itemId) - 1
  }
}

function deriveSelected(state: State, itemPath: ItemPath): 'single' | 'multi' | 'non' {
  const targetItemPath = state.pages[CurrentState.getActivePageId()].targetItemPath
  const anchorItemPath = state.pages[CurrentState.getActivePageId()].anchorItemPath
  if (RArray$.shallowEqual(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    if (RArray$.shallowEqual(itemPath, targetItemPath)) return 'single'
    else return 'non'
  }

  if (!RArray$.shallowEqual(RArray$.pop(itemPath), RArray$.pop(targetItemPath))) {
    // 選択されたItemPath群がこのItemPathと異なる子リスト上に存在する場合
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
