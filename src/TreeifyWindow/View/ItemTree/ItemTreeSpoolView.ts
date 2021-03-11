import {html, TemplateResult} from 'lit-html'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {Item, State} from 'src/TreeifyWindow/Internal/State'

export type ItemTreeSpoolViewModel = {
  bulletState: ItemTreeBulletState
  onClick: (event: MouseEvent) => void
}

enum ItemTreeBulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
  PAGE,
}

export function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath,
  item: Item
): ItemTreeSpoolViewModel {
  const bulletState = deriveBulletState(state, item)

  const onClick = (event: MouseEvent) => {
    NextState.setFocusedItemPath(itemPath)

    const inputId = InputId.fromMouseEvent(event)
    switch (bulletState) {
      case ItemTreeBulletState.NO_CHILDREN:
        switch (inputId) {
          case '1000MouseButton0':
            NullaryCommand.becomeAndShowPage()
            break
        }
        break
      case ItemTreeBulletState.UNFOLDED:
        switch (inputId) {
          case '0000MouseButton0':
            NullaryCommand.toggleFolded()
            break
          case '1000MouseButton0':
            NullaryCommand.becomeAndShowPage()
            break
        }
        break
      case ItemTreeBulletState.FOLDED:
        switch (inputId) {
          case '0000MouseButton0':
            NullaryCommand.toggleFolded()
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
    NextState.commit()
  }

  return {bulletState, onClick}
}

function deriveBulletState(state: State, item: Item): ItemTreeBulletState {
  if (state.pages[item.itemId] !== undefined) {
    return ItemTreeBulletState.PAGE
  } else if (item.childItemIds.size === 0) {
    return ItemTreeBulletState.NO_CHILDREN
  } else {
    return item.isFolded ? ItemTreeBulletState.FOLDED : ItemTreeBulletState.UNFOLDED
  }
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel): TemplateResult {
  return html`<div class="item-tree-spool" @click=${viewModel.onClick}>
    ${viewModel.bulletState === ItemTreeBulletState.UNFOLDED
      ? html`<div class="item-tree-spool_indent-area">
          <div class="item-tree-spool_indent-line"></div>
        </div>`
      : undefined}
    <div class="item-tree-spool_bullet-area">
      ${viewModel.bulletState === ItemTreeBulletState.PAGE
        ? html`<div class="item-tree-spool_page-icon" />`
        : html`
            ${viewModel.bulletState === ItemTreeBulletState.FOLDED
              ? html`<div class="item-tree-spool_outer-circle"></div>`
              : undefined}
            <div class="item-tree-spool_inner-circle"></div>
          `}
    </div>
  </div>`
}
