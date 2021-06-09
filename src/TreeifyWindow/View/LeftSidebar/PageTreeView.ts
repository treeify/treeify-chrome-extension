import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createPageTreeRootNodeViewModel,
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
