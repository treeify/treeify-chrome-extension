import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {ItemType} from 'src/Common/basicType'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTreeContentView'

export type ItemTreeWebPageContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  isUnloaded: boolean
  onFocus: (event: FocusEvent) => void
  onClickTitle: (event: MouseEvent) => void
  onClickFavicon: (event: MouseEvent) => void
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
    <img
      class=${classMap({
        'item-tree-web-page-content_favicon': true,
        'unloaded-item': viewModel.isUnloaded,
      })}
      src=${faviconUrl}
      @click=${viewModel.onClickFavicon}
    />
    <div
      class=${classMap({
        'item-tree-web-page-content_title': true,
        'unloaded-item': viewModel.isUnloaded,
      })}
      @click="${viewModel.onClickTitle}"
    >
      ${viewModel.title}
    </div>
  </div>`
}
