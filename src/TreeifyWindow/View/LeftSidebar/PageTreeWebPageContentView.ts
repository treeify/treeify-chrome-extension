import {html} from 'lit-html'
import {ItemType} from 'src/Common/basicType'

export type PageTreeWebPageContentViewModel = {
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
}

export function PageTreeWebPageContentView(viewModel: PageTreeWebPageContentViewModel) {
  return html`<div class="page-tree-web-page-content">
    <img class="page-tree-web-page-content_favicon" src=${viewModel.faviconUrl} />
    <div class="page-tree-web-page-content_title">${viewModel.title}</div>
  </div>`
}
