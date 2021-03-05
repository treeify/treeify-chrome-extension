import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'

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
    <div
      class=${classMap({
        'page-tree-bullet-and-indent_bullet-area': true,
        'no-children': viewModel.bulletState === PageTreeBulletState.NO_CHILDREN,
        unfolded: viewModel.bulletState === PageTreeBulletState.UNFOLDED,
        folded: viewModel.bulletState === PageTreeBulletState.FOLDED,
      })}
    ></div>
  </div>`
}
