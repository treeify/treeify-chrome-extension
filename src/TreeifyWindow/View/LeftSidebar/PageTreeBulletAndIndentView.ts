import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'

export type PageTreeBulletAndIndentViewModel = {
  bulletState: PageTreeBulletState
}

enum PageTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
}

export function createPageTreeBulletAndIndentViewModel(
  hasChildren: boolean
): PageTreeBulletAndIndentViewModel {
  if (hasChildren) {
    return {
      bulletState: PageTreeBulletState.EXPANDED,
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
    ${viewModel.bulletState === PageTreeBulletState.EXPANDED
      ? html`<div class="page-tree-bullet-and-indent_indent-area">
          <div class="page-tree-bullet-and-indent_indent-line"></div>
        </div>`
      : undefined}
    <div
      class=${classMap({
        'page-tree-bullet-and-indent_bullet-area': true,
        'no-children': viewModel.bulletState === PageTreeBulletState.NO_CHILDREN,
        expanded: viewModel.bulletState === PageTreeBulletState.EXPANDED,
        collapsed: viewModel.bulletState === PageTreeBulletState.COLLAPSED,
      })}
    ></div>
  </div>`
}
