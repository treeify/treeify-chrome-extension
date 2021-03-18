import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {ItemType} from 'src/Common/basicType'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
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
}

export function createItemTreeWebPageContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeWebPageContentViewModel {
  const webPageItem = state.webPageItems[itemPath.itemId]
  const tabId = External.instance.itemIdToTabId.get(itemPath.itemId)

  const isLoading =
    tabId !== undefined ? External.instance.tabIdToTab.get(tabId)?.status === 'loading' : false
  const isAudible =
    tabId !== undefined ? External.instance.tabIdToTab.get(tabId)?.audible === true : false

  return {
    itemPath,
    itemType: ItemType.WEB_PAGE,
    title: webPageItem.title ?? webPageItem.tabTitle,
    faviconUrl: webPageItem.faviconUrl,
    isLoading,
    isUnloaded: tabId === undefined,
    isAudible,
    onFocus: (event) => {
      doWithErrorHandling(() => {
        NextState.setTargetItemPath(itemPath)
        NextState.commit()
      })
    },
    onClickTitle: (event) => {
      doWithErrorHandling(() => {
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            NextState.setTargetItemPath(itemPath)
            NullaryCommand.browseWebPageItem()
            break
          case '1000MouseButton0':
            NextState.setTargetItemPath(itemPath)
            NextState.commit()
        }
      })
    },
    onClickFavicon: (event) => {
      doWithErrorHandling(() => {
        NextState.setTargetItemPath(itemPath)

        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()

            if (tabId === undefined) {
              // アンロード状態の場合
              NullaryCommand.loadSubtree()
            } else {
              // ロード状態の場合
              NullaryCommand.unloadSubtree()
            }

            NextState.commit()
            break
          case '1000MouseButton0':
            event.preventDefault()

            if (tabId === undefined) {
              // アンロード状態の場合
              NullaryCommand.loadItem()
            } else {
              // ロード状態の場合
              NullaryCommand.unloadItem()
            }

            NextState.commit()
            break
        }
      })
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
