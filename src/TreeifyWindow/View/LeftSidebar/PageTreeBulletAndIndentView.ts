import {html, TemplateResult} from 'lit-html'

export type PageTreeBulletAndIndentViewModel = {
  bulletState: PageTreeBulletState
}

enum PageTreeBulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
}

export function createPageTreeBulletAndIndentViewModel(
  hasChildren: boolean
): PageTreeBulletAndIndentViewModel {
  if (hasChildren) {
    return {
      bulletState: PageTreeBulletState.UNFOLDED,
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
    }
  }
}

/** ページツリーのバレットとインデント */
export function PageTreeBulletAndIndentView(
  viewModel: PageTreeBulletAndIndentViewModel
): TemplateResult {
  return html`<div class="page-tree-bullet-and-indent">
    ${viewModel.bulletState === PageTreeBulletState.UNFOLDED
      ? html`<div class="page-tree-bullet-and-indent_indent-area">
          <div class="page-tree-bullet-and-indent_indent-line"></div>
        </div>`
      : undefined}
    <div class="page-tree-bullet-and-indent_bullet-area"></div>
  </div>`
}
