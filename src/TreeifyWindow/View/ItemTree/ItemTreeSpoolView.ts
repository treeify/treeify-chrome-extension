import {html, TemplateResult} from 'lit-html'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'
import {Item, State} from 'src/TreeifyWindow/Model/State'

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
    // TODO: InputIdに応じたコマンドを実行する
    switch (bulletState) {
      case ItemTreeBulletState.NO_CHILDREN:
      case ItemTreeBulletState.UNFOLDED:
      case ItemTreeBulletState.FOLDED:
        NextState.setFocusedItemPath(itemPath)
        NullaryCommand.toggleFolded()
        NextState.commit()
        break
      case ItemTreeBulletState.PAGE:
        // ページアイコンのクリック時はアクティブページを切り替える
        NullaryCommand.showPage()
        NextState.commit()
        break
    }
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
