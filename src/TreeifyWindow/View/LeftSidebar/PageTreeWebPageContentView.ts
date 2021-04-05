import {html} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {css} from 'src/TreeifyWindow/View/css'

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

export const PageTreeWebPageContentCss = css`
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --page-tree-favicon-size: 1em;
  }

  .page-tree-web-page-content {
    /* ファビコンとタイトルを横に並べる */
    display: flex;
    align-items: center;
  }

  .page-tree-web-page-content_favicon {
    width: var(--page-tree-favicon-size);
    height: var(--page-tree-favicon-size);
  }
`
