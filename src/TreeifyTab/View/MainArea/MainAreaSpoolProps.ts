import {is} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {ItemDragData} from 'src/TreeifyTab/View/dragAndDrop'

export type MainAreaSpoolProps = {
  bulletState: MainAreaBulletState
  /**
   * expand時に表示されるアイテム数。
   * collapsed状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  onClick: (event: MouseEvent) => void
  onItemDrop: (event: MouseEvent, data: ItemDragData) => void
}

export enum MainAreaBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
  PAGE,
}

export function createMainAreaSpoolProps(state: State, itemPath: ItemPath): MainAreaSpoolProps {
  const bulletState = deriveBulletState(state, itemPath)

  const onClick = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (bulletState) {
        case MainAreaBulletState.NO_CHILDREN:
          switch (inputId) {
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case MainAreaBulletState.EXPANDED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case MainAreaBulletState.COLLAPSED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case MainAreaBulletState.PAGE:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.showPage()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoNonPageAndExpand()
              Rerenderer.instance.rerender()
          }
          break
      }
      Rerenderer.instance.rerender()
    })
  }

  const onItemDrop = (event: MouseEvent, data: ItemDragData) => {
    const itemId = ItemPath.getItemId(itemPath)
    const draggedItemPath = data.itemPath
    const draggedItemId = ItemPath.getItemId(draggedItemPath)
    const isDisplayingChildItemIds = !CurrentState.getDisplayingChildItemIds(itemPath).isEmpty()

    if (is(itemPath.take(draggedItemPath.size), draggedItemPath)) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return
    }

    // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
    const parentItemId = ItemPath.getParentItemId(draggedItemPath)
    if (parentItemId === undefined) return

    if (event.altKey) {
      if (!CurrentState.isSibling(itemPath, draggedItemPath)) {
        // エッジを追加する（トランスクルード）
        if (isDisplayingChildItemIds) {
          CurrentState.insertLastChildItem(itemId, draggedItemId)
        } else {
          CurrentState.insertFirstChildItem(itemId, draggedItemId)
        }
      }
    } else {
      // targetItemPathが実在しなくなるので退避
      const aboveItemPath = CurrentState.findAboveItemPath(draggedItemPath)
      assertNonUndefined(aboveItemPath)
      CurrentState.setTargetItemPath(aboveItemPath)

      // エッジを付け替える
      const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
      if (isDisplayingChildItemIds) {
        CurrentState.insertLastChildItem(itemId, draggedItemId, edge)
      } else {
        CurrentState.insertFirstChildItem(itemId, draggedItemId, edge)
      }
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    Rerenderer.instance.rerender()
  }

  return {bulletState, hiddenItemsCount: countHiddenItems(state, itemPath), onClick, onItemDrop}
}

function countHiddenItems(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  if (bulletState !== MainAreaBulletState.COLLAPSED) return 0

  const counts = state.items[ItemPath.getItemId(itemPath)].childItemIds.map((childItemId) => {
    return CurrentState.getDisplayingChildItemIds(itemPath.push(childItemId)).size
  })
  return counts.size + counts.reduce((a: integer, x) => a + x, 0)
}

export function deriveBulletState(state: State, itemPath: ItemPath): MainAreaBulletState {
  const itemId = ItemPath.getItemId(itemPath)
  if (state.pages[itemId] !== undefined) {
    return MainAreaBulletState.PAGE
  } else if (state.items[itemId].childItemIds.size === 0) {
    return MainAreaBulletState.NO_CHILDREN
  } else {
    CurrentState.getIsCollapsed(itemPath)
    return CurrentState.getIsCollapsed(itemPath)
      ? MainAreaBulletState.COLLAPSED
      : MainAreaBulletState.EXPANDED
  }
}
