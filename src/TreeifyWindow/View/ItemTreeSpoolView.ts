import {html, TemplateResult} from 'lit-html'

export enum BulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
  PAGE,
}

export type ItemTreeSpoolViewModel = {
  bulletState: BulletState
  onClick: (event: MouseEvent) => void
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel): TemplateResult {
  return html`<div class="item-tree-spool" @click=${viewModel.onClick}>
    ${viewModel.bulletState === BulletState.UNFOLDED
      ? html`<div class="item-tree-spool_indent-area">
          <div class="item-tree-spool_indent-line"></div>
        </div>`
      : undefined}
    <div class="item-tree-spool_bullet-area">
      ${viewModel.bulletState === BulletState.PAGE
        ? html`<img class="item-tree-spool_page-icon"></img>`
        : html`
            ${viewModel.bulletState === BulletState.FOLDED
              ? html`<div class="item-tree-spool_outer-circle"></div>`
              : undefined}
            <div class="item-tree-spool_inner-circle"></div>
          `}
    </div>
  </div>`
}
