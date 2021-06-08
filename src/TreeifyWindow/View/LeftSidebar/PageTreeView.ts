import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'
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
