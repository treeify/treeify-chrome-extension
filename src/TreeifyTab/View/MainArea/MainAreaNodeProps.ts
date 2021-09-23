import {is, List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {CommandId, ItemId} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {
  createMainAreaContentProps,
  MainAreaContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import {
  createMainAreaSpoolProps,
  deriveBulletState,
  MainAreaBulletState,
  MainAreaSpoolProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaSpoolProps'

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
  cssClasses: List<string>
  footprintRank: integer | undefined
  footprintCount: integer
  hiddenTabsCount: integer
  contentProps: MainAreaContentProps
  childItemPropses: List<MainAreaNodeProps>
  spoolProps: MainAreaSpoolProps
  onMouseDownContentArea: (event: MouseEvent) => void
  onContextMenu: (event: Event) => void
  onClickDeleteButton: (event: MouseEvent) => void
  onClickHiddenTabsCount: (event: MouseEvent) => void
}

export function createMainAreaNodeProps(
  state: State,
  footprintRankMap: Map<ItemId, integer>,
  footprintCount: integer,
  itemPath: ItemPath
): MainAreaNodeProps {
  const itemId = ItemPath.getItemId(itemPath)
  const item = state.items[itemId]
  const displayingChildItemIds = CurrentState.getDisplayingChildItemIds(itemPath)

  return {
    itemPath,
    isActivePage: !ItemPath.hasParent(itemPath),
    selected: deriveSelected(state, itemPath),
    isTranscluded: Object.keys(item.parents).length > 1,
    isExcluded: CurrentState.getExcludedItemIds().contains(itemId),
    cssClasses: item.cite === null ? item.cssClasses : item.cssClasses.push('citation'),
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenLoadedTabs(state, itemPath),
    spoolProps: createMainAreaSpoolProps(state, itemPath),
    contentProps: createMainAreaContentProps(state, itemPath, item.type),
    childItemPropses: displayingChildItemIds.map((childItemId: ItemId) => {
      return createMainAreaNodeProps(
        state,
        footprintRankMap,
        footprintCount,
        itemPath.push(childItemId)
      )
    }),
    onMouseDownContentArea: (event: MouseEvent) => {
      doWithErrorCapture(() => {
        switch (InputId.fromMouseEvent(event)) {
          case '0100MouseButton0':
            const targetItemPath = CurrentState.getTargetItemPath()
            // テキスト選択をさせるためにブラウザのデフォルトの挙動に任せる
            if (is(itemPath, targetItemPath)) break

            event.preventDefault()

            // 同じ兄弟リストに降りてくるまでtargetとanchorの両方をカットする
            const commonPrefix = ItemPath.getCommonPrefix(itemPath, targetItemPath)
            const targetCandidate = itemPath.take(commonPrefix.size + 1)
            const anchorCandidate = targetItemPath.take(commonPrefix.size + 1)
            if (targetCandidate.size === anchorCandidate.size) {
              CurrentState.setTargetItemPathOnly(targetCandidate)
              CurrentState.setAnchorItemPath(anchorCandidate)
              Rerenderer.instance.rerender()
            }
            break
          case '0000MouseButton1':
          case '1000MouseButton2':
            event.preventDefault()
            Internal.instance.saveCurrentStateToUndoStack()
            CurrentState.setTargetItemPath(itemPath)
            Command.removeEdge()
            Rerenderer.instance.rerender()
            break
          case '1000MouseButton1':
            event.preventDefault()
            Internal.instance.saveCurrentStateToUndoStack()
            CurrentState.setTargetItemPath(itemPath)
            Command.deleteItemItself()
            Rerenderer.instance.rerender()
            break
          case '0000MouseButton2':
            // 複数選択中に選択範囲内を右クリックした場合はtargetItemPathを更新せず、
            // その複数選択された項目をコンテキストメニューの操作対象にする。
            if (
              CurrentState.getSelectedItemPaths().size === 1 ||
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
      })
    },
    onContextMenu: (event: Event) => {
      // テキスト選択中はブラウザ標準のコンテキストメニューを表示する
      if (getSelection()?.isCollapsed === false) return

      if (event instanceof MouseEvent) {
        // 独自コンテキストメニューを表示
        event.preventDefault()

        if (InputId.fromMouseEvent(event) !== '0000MouseButton2') return

        // 複数選択中に選択範囲内を右クリックした場合はtargetItemPathを更新せず、
        // その複数選択された項目をコンテキストメニューの操作対象にする。
        if (!CurrentState.isInSubtreeOfSelectedItemPaths(itemPath)) {
          CurrentState.setTargetItemPath(itemPath)
        }
        Command.showContextMenuDialog({x: event.clientX, y: event.clientY})
        Rerenderer.instance.rerender()
      }
    },
    onClickDeleteButton: (event) => {
      doWithErrorCapture(() => {
        Internal.instance.saveCurrentStateToUndoStack()

        CurrentState.setTargetItemPath(itemPath)

        const inputId = InputId.fromMouseEvent(event)
        const commandIds: List<CommandId> | undefined =
          state.mainAreaDeleteButtonMouseBindings[inputId]
        if (commandIds !== undefined) {
          event.preventDefault()
          for (const commandId of commandIds) {
            // @ts-ignore
            Command[commandId]?.()
          }
        }
        Rerenderer.instance.rerender()
      })
    },
    onClickHiddenTabsCount: (event: MouseEvent) => {
      CurrentState.setTargetItemPath(itemPath)
      Command.hardUnloadSubtree()
      Rerenderer.instance.rerender()
    },
  }
}

function countHiddenLoadedTabs(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  switch (bulletState) {
    case MainAreaBulletState.NO_CHILDREN:
    case MainAreaBulletState.EXPANDED:
    case MainAreaBulletState.PAGE:
      return 0
    case MainAreaBulletState.COLLAPSED:
      return countLoadedTabsInDescendants(state, ItemPath.getItemId(itemPath))
    default:
      assertNeverType(bulletState)
  }
}

// 指定された項目の子孫項目に対応するロード状態のタブを数える。
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
