import {html, TemplateResult} from 'lit-html'

export enum BulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
}

export type ItemTreeBulletViewModel = {
  bulletState: BulletState
  onClick: (event: MouseEvent) => void
}

/** アイテムツリーのバレット */
export function ItemTreeBulletView(viewModel: ItemTreeBulletViewModel): TemplateResult {
  return html`<div class="item-tree-bullet" @click=${viewModel.onClick}>
    ${viewModel.bulletState === BulletState.FOLDED
      ? html`<div class="item-tree-bullet_outer-circle" />`
      : undefined}
    <div class="item-tree-bullet_inner-circle" />
  </div>`
}
