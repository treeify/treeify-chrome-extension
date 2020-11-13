import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTreeContentView'

export type ItemTreeWebPageContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  onFocus: (event: FocusEvent) => void
}

/** ウェブページアイテムのコンテンツ領域のView */
export function ItemTreeWebPageContentView(
  viewModel: ItemTreeWebPageContentViewModel
): TemplateResult {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  const faviconUrl =
    viewModel.faviconUrl.length > 0 ? viewModel.faviconUrl : './default-favicon.svg'
  return html`<div
    class="item-tree-web-page-content"
    id=${id}
    tabindex="0"
    @focus=${viewModel.onFocus}
  >
    <img class="item-tree-web-page-content_favicon" src=${faviconUrl} />
    <div class="item-tree-web-page-content_title">${viewModel.title}</div>
  </div>`
}
