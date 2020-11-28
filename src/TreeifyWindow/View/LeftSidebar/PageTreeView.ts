import {State} from 'src/TreeifyWindow/Model/State'
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
  return PageTreeNodeView(viewModel.pageTreeRootNodeViewModel)
}
