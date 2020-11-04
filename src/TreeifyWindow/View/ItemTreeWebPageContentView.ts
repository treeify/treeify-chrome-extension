import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'

export type ItemTreeWebPageContentViewModel = {
  itemType: ItemType.WEB_PAGE
  title: string
}

/** ウェブページアイテムのコンテンツ領域のView */
export function ItemTreeWebPageContentView(
  viewModel: ItemTreeWebPageContentViewModel
): TemplateResult {
  return html`<div class="item-tree-web-page-content">${viewModel.title}</div>`
}
