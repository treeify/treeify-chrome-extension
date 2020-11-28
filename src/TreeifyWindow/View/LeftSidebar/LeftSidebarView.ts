import {html} from 'lit-html'
import {PageTreeView, PageTreeViewModel} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'

export type LeftSidebarViewModel = {
  pageTreeViewModel: PageTreeViewModel
}

export function LeftSidebarView(viewModel: LeftSidebarViewModel) {
  return html`<aside class="left-sidebar">${PageTreeView(viewModel.pageTreeViewModel)}</aside>`
}
