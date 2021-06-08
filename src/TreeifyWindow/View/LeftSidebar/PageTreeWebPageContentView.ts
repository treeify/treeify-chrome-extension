import {ItemType} from 'src/TreeifyWindow/basicType'
import {createDivElement, createImgElement} from 'src/TreeifyWindow/View/createElement'

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
