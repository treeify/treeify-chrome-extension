import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { integer } from 'src/Utility/integer'

export type MainAreaRollProps = {
  bulletState: MainAreaBulletState
  /**
   * unfold時に表示される項目数。
   * folded状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  outerCircleRadiusEm: integer
  onClick(event: MouseEvent): void
  onContextMenu(event: Event): void
}

export enum MainAreaBulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
  PAGE,
}

export function createMainAreaRollProps(state: State, itemPath: ItemPath): MainAreaRollProps {
  const hiddenItemsCount = countHiddenItems(state, itemPath)

  const outerCircleMinDiameter =
    CssCustomProperty.getNumber('--main-area-bullet-outer-circle-min-diameter') ?? 1.05
  const outerCircleMaxDiameter =
    CssCustomProperty.getNumber('--main-area-bullet-outer-circle-max-diameter') ?? 1.3
  const outerCircleItemCountLimit =
    CssCustomProperty.getNumber('--main-area-bullet-outer-circle-item-count-limit') ?? 20
  const step = (outerCircleMaxDiameter - outerCircleMinDiameter) / outerCircleItemCountLimit
  const limitedHiddenItemsCount = Math.min(hiddenItemsCount, outerCircleItemCountLimit)
  const outerCircleRadiusEm = outerCircleMinDiameter + limitedHiddenItemsCount * step

  return {
    bulletState: deriveBulletState(state, itemPath),
    hiddenItemsCount,
    outerCircleRadiusEm,
    onClick(event: MouseEvent) {
      Internal.instance.saveCurrentStateToUndoStack()
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (deriveBulletState(state, itemPath)) {
        case MainAreaBulletState.NO_CHILDREN:
          switch (inputId) {
            case '1000MouseButton0':
              Command.unfold()
              Command.turnIntoPage()
              break
          }
          break
        case MainAreaBulletState.UNFOLDED:
          switch (inputId) {
            case '0000MouseButton0':
              Command.toggleFolded()
              break
            case '1000MouseButton0':
              Command.unfold()
              Command.turnIntoPage()
              break
          }
          break
        case MainAreaBulletState.FOLDED:
          switch (inputId) {
            case '0000MouseButton0':
              Command.toggleFolded()
              break
            case '1000MouseButton0':
              Command.unfold()
              Command.turnIntoPage()
              break
          }
          break
        case MainAreaBulletState.PAGE:
          switch (inputId) {
            case '0000MouseButton0':
              Command.switchPage()
              break
            case '1000MouseButton0':
              Command.turnIntoNonPage()
              Command.unfold()
              break
          }
          break
      }
      Rerenderer.instance.rerender()
    },
    onContextMenu(event: Event) {
      event.preventDefault()
      CurrentState.setTargetItemPath(itemPath)
      Command.showOtherParentsDialog()
      Rerenderer.instance.rerender()
    },
  }
}

function countHiddenItems(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  if (bulletState !== MainAreaBulletState.FOLDED) return 0

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
    CurrentState.getIsFolded(itemPath)
    return CurrentState.getIsFolded(itemPath)
      ? MainAreaBulletState.FOLDED
      : MainAreaBulletState.UNFOLDED
  }
}
