import {html} from 'lit-html'
import {State} from 'src/TreeifyWindow/Internal/State'
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
  return html`<div class="page-tree">${PageTreeNodeView(viewModel.pageTreeRootNodeViewModel)}</div>`
}
