import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {ItemType} from 'src/Common/basicType'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'
import {State} from 'src/TreeifyWindow/Model/State'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

export type ItemTreeWebPageContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  isLoading: boolean
  isUnloaded: boolean
  isAudible: boolean
  onFocus: (event: FocusEvent) => void
  onClickTitle: (event: MouseEvent) => void
  onClickFavicon: (event: MouseEvent) => void
  onBlur: (event: FocusEvent) => void
}

export function createItemTreeWebPageContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeWebPageContentViewModel {
  const webPageItem = state.webPageItems[itemPath.itemId]
  const tabId = Model.instance.itemIdToTabId.get(itemPath.itemId)

  const isLoading =
    tabId !== undefined ? Model.instance.tabIdToTab.get(tabId)?.status === 'loading' : false
  const isAudible =
    tabId !== undefined ? Model.instance.tabIdToTab.get(tabId)?.audible === true : false

  return {
    itemPath,
    itemType: ItemType.WEB_PAGE,
    title: webPageItem.title ?? webPageItem.tabTitle,
    faviconUrl: webPageItem.faviconUrl,
    isLoading,
    isUnloaded: tabId === undefined,
    isAudible,
    onFocus: (event) => {
      NextState.setFocusedItemPath(itemPath)
      NextState.setBlurredItemPath(null)
      NextState.commitSilently()
    },
    onBlur: (event) => {
      NextState.setBlurredItemPath(itemPath)
      NextState.setFocusedItemPath(null)
      NextState.commitSilently()
    },
    onClickTitle: (event) => {
      switch (InputId.fromMouseEvent(event)) {
        case '0000MouseButton0':
          NextState.setFocusedItemPath(itemPath)
          NullaryCommand.browseWebPageItem()
          break
        case '1000MouseButton0':
          NextState.setFocusedItemPath(itemPath)
          NextState.commit()
      }
    },
    onClickFavicon: (event) => {
      NextState.setFocusedItemPath(itemPath)

      switch (InputId.fromMouseEvent(event)) {
        case '0000MouseButton0':
          event.preventDefault()
          NullaryCommand.unloadSubtree()
          NextState.commit()
          break
        case '1000MouseButton0':
          event.preventDefault()
          NullaryCommand.unloadItem()
          NextState.commit()
          break
      }
    },
  }
}

/** ウェブページアイテムのコンテンツ領域のView */
export function ItemTreeWebPageContentView(
  viewModel: ItemTreeWebPageContentViewModel
): TemplateResult {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return html`<div
    class="item-tree-web-page-content"
    id=${id}
    tabindex="0"
    @focus=${viewModel.onFocus}
    @blur=${viewModel.onBlur}
  >
    ${viewModel.isLoading
      ? html`<div
          class="item-tree-web-page-content_favicon loading-indicator"
          @click=${viewModel.onClickFavicon}
        />`
      : viewModel.faviconUrl.length > 0
      ? html`<img
          class=${classMap({
            'item-tree-web-page-content_favicon': true,
            'unloaded-item': viewModel.isUnloaded,
          })}
          src=${viewModel.faviconUrl}
          @click=${viewModel.onClickFavicon}
        /> `
      : html`<div
          class="item-tree-web-page-content_favicon default-favicon"
          @click=${viewModel.onClickFavicon}
        />`}
    <div
      class=${classMap({
        'item-tree-web-page-content_title': true,
        'unloaded-item': viewModel.isUnloaded,
      })}
      title=${viewModel.title}
      @click=${viewModel.onClickTitle}
    >
      ${viewModel.title}
    </div>
    ${viewModel.isAudible
      ? html`<div class="item-tree-web-page-content_audible-icon" />`
      : undefined}
  </div>`
}
