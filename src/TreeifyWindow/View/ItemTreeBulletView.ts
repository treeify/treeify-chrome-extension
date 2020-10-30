import {html, TemplateResult} from 'lit-html'

export enum BulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
}

export type ItemTreeBulletViewModel = {
  bulletState: BulletState
}

/** アイテムツリーのバレット */
export function ItemTreeBulletView(viewModel: ItemTreeBulletViewModel): TemplateResult {
  return html`<div class="item-tree-bullet">
    ${viewModel.bulletState === BulletState.FOLDED
      ? html`<div class="item-tree-bullet_outer-circle" />`
      : null}
    <div class="item-tree-bullet_inner-circle" />
  </div>`
}
