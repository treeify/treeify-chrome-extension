import {ItemType} from 'src/TreeifyWindow/basicType'
import {createDivElement, createImgElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'

export type PageTreeWebPageContentViewModel = {
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
}

export function PageTreeWebPageContentView(viewModel: PageTreeWebPageContentViewModel) {
  return createDivElement('page-tree-web-page-content', {}, [
    createImgElement({
      class: 'page-tree-web-page-content_favicon',
      src: viewModel.faviconUrl,
      draggable: 'false',
    }),
    createDivElement('page-tree-web-page-content_title', {}, [
      document.createTextNode(viewModel.title),
    ]),
  ])
}

export const PageTreeWebPageContentCss = css`
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --page-tree-favicon-size: 1em;
  }

  .page-tree-web-page-content {
    /* ファビコンとタイトルを横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
  }

  .page-tree-web-page-content_favicon {
    width: var(--page-tree-favicon-size);
    height: var(--page-tree-favicon-size);
  }
`
