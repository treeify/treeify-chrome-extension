import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'

export type ItemTreeWebPageContentViewModel = {
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  onFocus: (event: FocusEvent) => void
}

/** ウェブページアイテムのコンテンツ領域のView */
export function ItemTreeWebPageContentView(
  viewModel: ItemTreeWebPageContentViewModel
): TemplateResult {
  const faviconUrl =
    viewModel.faviconUrl.length > 0 ? viewModel.faviconUrl : './default-favicon.svg'
  return html`<div class="item-tree-web-page-content" tabindex="0" @focus=${viewModel.onFocus}>
    <img class="item-tree-web-page-content_favicon" src=${faviconUrl} />
    <div class="item-tree-web-page-content_title">${viewModel.title}</div>
  </div>`
}
