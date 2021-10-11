import {integer} from 'src/Common/integer'
import {CssCustomProperty} from 'src/TreeifyTab/CssCustomProperty'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type MainAreaRollProps = {
  bulletState: MainAreaBulletState
  /**
   * expand時に表示される項目数。
   * collapsed状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  outerCircleRadiusEm: integer
  onClick: (event: MouseEvent) => void
  onContextMenu: (event: Event) => void
}

export enum MainAreaBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
  PAGE,
}

export function createMainAreaRollProps(state: State, itemPath: ItemPath): MainAreaRollProps {
  const hiddenItemsCount = countHiddenItems(state, itemPath)

  const outerCircleMinDiameter = CssCustomProperty.getNumber('--outer-circle-min-diameter') ?? 1.1
  const outerCircleMaxDiameter = CssCustomProperty.getNumber('--outer-circle-max-diameter') ?? 1.35
  const outerCircleItemCountLimit =
    CssCustomProperty.getNumber('--outer-circle-item-count-limit') ?? 20
  const step = (outerCircleMaxDiameter - outerCircleMinDiameter) / outerCircleItemCountLimit
  const limitedHiddenItemsCount = Math.min(hiddenItemsCount, outerCircleItemCountLimit)
  const outerCircleRadiusEm = outerCircleMinDiameter + limitedHiddenItemsCount * step

  return {
    bulletState: deriveBulletState(state, itemPath),
    hiddenItemsCount,
    outerCircleRadiusEm,
    onClick: (event: MouseEvent) => {
      doWithErrorCapture(() => {
        Internal.instance.saveCurrentStateToUndoStack()
        CurrentState.setTargetItemPath(itemPath)

        const inputId = InputId.fromMouseEvent(event)
        switch (deriveBulletState(state, itemPath)) {
          case MainAreaBulletState.NO_CHILDREN:
            switch (inputId) {
              case '1000MouseButton0':
                Command.expand()
                Command.turnIntoPage()
                Command.showPage()
                break
            }
            break
          case MainAreaBulletState.EXPANDED:
            switch (inputId) {
              case '0000MouseButton0':
                Command.toggleCollapsed()
                break
              case '1000MouseButton0':
                Command.expand()
                Command.turnIntoPage()
                Command.showPage()
                break
            }
            break
          case MainAreaBulletState.COLLAPSED:
            switch (inputId) {
              case '0000MouseButton0':
                Command.toggleCollapsed()
                break
              case '1000MouseButton0':
                Command.expand()
                Command.turnIntoPage()
                Command.showPage()
                break
            }
            break
          case MainAreaBulletState.PAGE:
            switch (inputId) {
              case '0000MouseButton0':
                Command.showPage()
                break
              case '1000MouseButton0':
                Command.turnIntoNonPage()
                Command.expand()
                break
            }
            break
        }
        Rerenderer.instance.rerender()
      })
    },
    onContextMenu: (event: Event) => {
      event.preventDefault()
      CurrentState.setTargetItemPath(itemPath)
      Command.showOtherParentsDialog()
      Rerenderer.instance.rerender()
    },
  }
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
