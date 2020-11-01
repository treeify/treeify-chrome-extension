import {html, TemplateResult} from 'lit-html'

export enum BulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
}

export type ItemTreeSpoolViewModel = {
  bulletState: BulletState
  onClick: (event: MouseEvent) => void
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel): TemplateResult {
  return html`<div class="item-tree-spool" @click=${viewModel.onClick}>
    <div class="item-tree-spool_bullet-area">
      ${viewModel.bulletState === BulletState.FOLDED
        ? html`<div class="item-tree-spool_outer-circle" />`
        : undefined}
      <div class="item-tree-spool_inner-circle" />
    </div>
    <div class="item-tree-spool_indent-area"></div>
  </div>`
}
