import {is, List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
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
    cssClasses: item.cssClasses,
    footprintRank: footprintRankMap.get(itemId),
    footprintCount: footprintCount,
    hiddenTabsCount: countHiddenLoadedTabs(state, itemPath),
    spoolProps: createMainAreaSpoolProps(state, itemPath),
    contentProps: createMainAreaContentProps(state, itemPath, item.itemType),
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
            NullaryCommand.removeEdge()
            Rerenderer.instance.rerender()
            break
          case '1000MouseButton1':
            event.preventDefault()
            Internal.instance.saveCurrentStateToUndoStack()
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.deleteItemItself()
            Rerenderer.instance.rerender()
            break
          default:
            CurrentState.setTargetItemPath(itemPath)
            Rerenderer.instance.rerender()
            break
        }
      })
    },
    onContextMenu: (event: Event) => {
      // 独自コンテキストメニューを表示
      event.preventDefault()
      if (event instanceof MouseEvent) {
        if (InputId.fromMouseEvent(event) !== '0000MouseButton2') return
      }
      CurrentState.setTargetItemPath(itemPath)
      NullaryCommand.showContextMenuDialog()
      Rerenderer.instance.rerender()
    },
    onClickDeleteButton: (event) => {
      doWithErrorCapture(() => {
        Internal.instance.saveCurrentStateToUndoStack()

        CurrentState.setTargetItemPath(itemPath)

        const inputId = InputId.fromMouseEvent(event)
        const commands: List<Command> | undefined = state.mainAreaDeleteButtonMouseBinding[inputId]
        if (commands !== undefined) {
          event.preventDefault()
          for (const command of commands) {
            Command.execute(command)
          }
        }
        Rerenderer.instance.rerender()
      })
    },
    onClickHiddenTabsCount: (event: MouseEvent) => {
      Internal.instance.saveCurrentStateToUndoStack()
      CurrentState.setTargetItemPath(itemPath)
      NullaryCommand.hardUnloadSubtree()
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
