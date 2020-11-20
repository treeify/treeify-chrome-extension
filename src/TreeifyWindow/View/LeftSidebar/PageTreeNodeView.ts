import {html} from 'lit-html'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  createPageTreeContentViewModel,
  PageTreeContentView,
  PageTreeContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeContentView'

export type PageTreeNodeViewModel = {
  contentViewModel: PageTreeContentViewModel
  // childNodeViewModels: List<PageTreeNodeViewModel>
}

export function createPageTreeRootViewModel(state: State): PageTreeNodeViewModel {
  return {
    contentViewModel: createPageTreeContentViewModel(state, 0),
  }
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel) {
  return html`<div>${PageTreeContentView(viewModel.contentViewModel)}</div>`
}
