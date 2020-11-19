import {html} from 'lit-html'
import {
  PageTreeContentView,
  PageTreeContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeContentView'

export type PageTreeNodeViewModel = {
  contentViewModel: PageTreeContentViewModel
  // childNodeViewModels: List<PageTreeNodeViewModel>
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel) {
  return html`<div>${PageTreeContentView(viewModel.contentViewModel)}</div>`
}
