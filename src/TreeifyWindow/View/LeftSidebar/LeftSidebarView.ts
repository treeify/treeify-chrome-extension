import {html} from 'lit-html'
import {
  PageTreeNodeView,
  PageTreeNodeViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeNodeView'

export type LeftSidebarViewModel = {
  pageTreeNodeViewModel: PageTreeNodeViewModel
}

export function LeftSidebarView(viewModel: LeftSidebarViewModel) {
  return html`<aside class="left-sidebar">
    ${PageTreeNodeView(viewModel.pageTreeNodeViewModel)}
  </aside>`
}
