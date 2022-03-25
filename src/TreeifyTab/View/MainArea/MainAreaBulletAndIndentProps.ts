import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { dtdd } from 'src/TreeifyTab/other'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'

export type MainAreaBulletAndIndentProps = {
  bulletState: MainAreaBulletState
  /**
   * unfold時に表示される項目数。
   * folded状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  outerCircleSizeEm: integer
  tooltipText: string
  onClick(event: MouseEvent): void
  onContextMenu(event: Event): void
}

export enum MainAreaBulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
  PAGE,
}

export function createMainAreaBulletAndIndentProps(
  state: State,
  itemPath: ItemPath
): MainAreaBulletAndIndentProps {
  const hiddenItemsCount = countHiddenItems(state, itemPath)
  const bulletState = deriveBulletState(state, itemPath)

  const outerCircleMinSize = CssCustomProperty.getNumber('--bullet-outer-circle-min-size-em')
  assertNonUndefined(outerCircleMinSize)
  const outerCircleMaxSize = CssCustomProperty.getNumber('--bullet-outer-circle-max-size-em')
  assertNonUndefined(outerCircleMaxSize)
  const outerCircleItemCountLimit = CssCustomProperty.getNumber(
    '--bullet-outer-circle-item-count-limit'
  )
  assertNonUndefined(outerCircleItemCountLimit)
  const step = (outerCircleMaxSize - outerCircleMinSize) / outerCircleItemCountLimit
  const limitedHiddenItemsCount = Math.min(hiddenItemsCount, outerCircleItemCountLimit)
  const outerCircleSizeEm = outerCircleMinSize + limitedHiddenItemsCount * step

  return {
    bulletState,
    hiddenItemsCount,
    outerCircleSizeEm,
    tooltipText: call(() => {
      switch (bulletState) {
        case MainAreaBulletState.NO_CHILDREN:
        case MainAreaBulletState.UNFOLDED:
        case MainAreaBulletState.FOLDED:
          return []
        case MainAreaBulletState.PAGE:
          return [
            dtdd('クリック', 'ページを切り替える'),
            dtdd('Ctrl+クリック', '非ページ化する'),
            dtdd('Shift+クリック', 'ページツリーに追加せずにページを切り替える'),
          ]
      }
    }).join('\n'),
    onClick(event: MouseEvent) {
      Internal.instance.saveCurrentStateToUndoStack()
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (bulletState) {
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
              Command.fold()
              Rerenderer.instance.requestToScrollAppear()
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
              Command.unfold()
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
              CurrentState.switchActivePage(ItemPath.getItemId(itemPath))
              break
            case '1000MouseButton0':
              Command.turnIntoNonPage()
              Command.unfold()
              break
            case '0100MouseButton0':
              Command.switchPage()
              break
          }
          break
      }
      Rerenderer.instance.requestToFocusTargetItem()
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
    return CurrentState.getDisplayingChildItemIds(RArray$.append(childItemId)(itemPath)).length
  })
  return counts.length + RArray$.sum(counts)
}

export function deriveBulletState(state: State, itemPath: ItemPath): MainAreaBulletState {
  const itemId = ItemPath.getItemId(itemPath)
  if (state.pages[itemId] !== undefined) {
    return MainAreaBulletState.PAGE
  } else if (state.items[itemId].childItemIds.length === 0) {
    return MainAreaBulletState.NO_CHILDREN
  } else {
    CurrentState.getIsFolded(itemPath)
    return CurrentState.getIsFolded(itemPath)
      ? MainAreaBulletState.FOLDED
      : MainAreaBulletState.UNFOLDED
  }
}
