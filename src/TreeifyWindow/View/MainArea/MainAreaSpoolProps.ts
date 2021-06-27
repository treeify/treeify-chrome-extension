import {integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type MainAreaSpoolProps = {
  bulletState: MainAreaBulletState
  /**
   * expand時に表示されるアイテム数。
   * collapsed状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  onClick: (event: MouseEvent) => void
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

  return {bulletState, hiddenItemsCount: countHiddenItems(state, itemPath), onClick}
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
