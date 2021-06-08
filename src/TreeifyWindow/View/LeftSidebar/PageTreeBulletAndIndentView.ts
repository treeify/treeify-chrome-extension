import {classMap, createDivElement} from 'src/TreeifyWindow/View/createElement'

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
export function PageTreeBulletAndIndentView(viewModel: PageTreeBulletAndIndentViewModel) {
  return createDivElement('page-tree-bullet-and-indent', {}, [
    viewModel.bulletState === PageTreeBulletState.EXPANDED
      ? createDivElement('page-tree-bullet-and-indent_indent-area', {}, [
          createDivElement('page-tree-bullet-and-indent_indent-line'),
        ])
      : undefined,
    createDivElement(
      classMap({
        'page-tree-bullet-and-indent_bullet-area': true,
        'no-children': viewModel.bulletState === PageTreeBulletState.NO_CHILDREN,
        expanded: viewModel.bulletState === PageTreeBulletState.EXPANDED,
        collapsed: viewModel.bulletState === PageTreeBulletState.COLLAPSED,
      })
    ),
  ])
}
