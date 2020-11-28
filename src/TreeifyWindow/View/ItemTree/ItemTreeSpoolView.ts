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
  const onClick = () => {
    if (NextState.isPage(itemPath.itemId)) {
      // ページアイコンのクリック時はアクティブページを切り替える
      NextState.setActivePageId(itemPath.itemId)
      NextState.mountPage(itemPath.itemId)
      NextState.commit()
    } else {
      NextState.setFocusedItemPath(itemPath)
      NullaryCommand.toggleFolded()
      NextState.commit()
    }
  }
  if (state.pages[item.itemId] !== undefined) {
    return {
      bulletState: ItemTreeBulletState.PAGE,
      onClick,
    }
  } else if (item.childItemIds.size === 0) {
    return {
      bulletState: ItemTreeBulletState.NO_CHILDREN,
      onClick,
    }
  } else {
    return {
      bulletState: item.isFolded ? ItemTreeBulletState.FOLDED : ItemTreeBulletState.UNFOLDED,
      onClick,
    }
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
