import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'
import {
  createPageTreeRootNodeViewModel,
  PageTreeNodeView,
  PageTreeNodeViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeNodeView'

export type PageTreeViewModel = {
  pageTreeRootNodeViewModel: PageTreeNodeViewModel
}

export function createPageTreeViewModel(state: State): PageTreeViewModel {
  return {
    pageTreeRootNodeViewModel: createPageTreeRootNodeViewModel(state),
  }
}

export function PageTreeView(viewModel: PageTreeViewModel) {
  return createDivElement('page-tree', {}, [PageTreeNodeView(viewModel.pageTreeRootNodeViewModel)])
}

export const PageTreeCss = css`
  :root {
    /* ページツリーのテキスト全般に適用されるline-height */
    --page-tree-line-height: 1.65;

    /* フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する */
    --page-tree-calculated-line-height: calc(1em * var(--item-tree-line-height));
  }

  .page-tree {
    font-size: 15px;
    line-height: var(--page-tree-line-height);

    /* ある程度大きめに余白をとっておかないと、下端付近でのスクロールの余裕がなくて窮屈になる */
    padding-bottom: 150px;
  }
`
