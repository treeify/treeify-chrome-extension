import {html, TemplateResult} from 'lit-html'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {Item, State} from 'src/TreeifyWindow/Internal/State'
import {doWithErrorHandling} from 'src/Common/Debug/report'

export type ItemTreeSpoolViewModel = {
  bulletState: ItemTreeBulletState
  onClick: (event: MouseEvent) => void
}

export enum ItemTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
  PAGE,
}

export function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath,
  item: Item
): ItemTreeSpoolViewModel {
  const bulletState = deriveBulletState(state, item)

  const onClick = (event: MouseEvent) => {
    doWithErrorHandling(() => {
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (bulletState) {
        case ItemTreeBulletState.NO_CHILDREN:
          switch (inputId) {
            case '1000MouseButton0':
              NullaryCommand.becomeAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.EXPANDED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.becomeAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.COLLAPSED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.becomeAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.PAGE:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.showPage()
              break
          }
          break
      }
      CurrentState.commit()
    })
  }

  return {bulletState, onClick}
}

export function deriveBulletState(state: State, item: Item): ItemTreeBulletState {
  if (state.pages[item.itemId] !== undefined) {
    return ItemTreeBulletState.PAGE
  } else if (item.childItemIds.size === 0) {
    return ItemTreeBulletState.NO_CHILDREN
  } else {
    return item.isCollapsed ? ItemTreeBulletState.COLLAPSED : ItemTreeBulletState.EXPANDED
  }
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel): TemplateResult {
  return html`<div class="item-tree-spool" @click=${viewModel.onClick}>
    ${viewModel.bulletState === ItemTreeBulletState.EXPANDED
      ? html`<div class="item-tree-spool_indent-area">
          <div class="item-tree-spool_indent-line"></div>
        </div>`
      : undefined}
    <div class="item-tree-spool_bullet-area">
      ${viewModel.bulletState === ItemTreeBulletState.PAGE
        ? html`<div class="item-tree-spool_page-icon" />`
        : html`
            ${viewModel.bulletState === ItemTreeBulletState.COLLAPSED
              ? html`<div class="item-tree-spool_outer-circle"></div>`
              : undefined}
            <div class="item-tree-spool_inner-circle"></div>
          `}
    </div>
  </div>`
}
