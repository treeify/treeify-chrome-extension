import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'

export type ItemTreeWebPageContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
  labels: List<string>
  title: string
  faviconUrl: string
  isLoading: boolean
  isUnloaded: boolean
  isUnread: boolean
  isAudible: boolean
  onFocus: (event: FocusEvent) => void
  onClickTitle: (event: MouseEvent) => void
  onClickFavicon: (event: MouseEvent) => void
}

export function createItemTreeWebPageContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeWebPageContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  const webPageItem = state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined
  const isUnloaded = tab === undefined || tab.discarded

  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.WEB_PAGE,
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: webPageItem.faviconUrl,
    isLoading: tab?.status === 'loading',
    isUnloaded,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
    onFocus: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
    onClickTitle: (event) => {
      doWithErrorCapture(() => {
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.browseTabInDualWindowMode()
            CurrentState.commit()
            break
          case '1000MouseButton0':
            CurrentState.setTargetItemPath(itemPath)
            CurrentState.commit()
            break
          case '0010MouseButton0':
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.browseTab()
            CurrentState.commit()
            break
        }
      })
    },
    onClickFavicon: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)

        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()

            if (isUnloaded) {
              // アンロード状態の場合
              NullaryCommand.loadSubtree()
            } else {
              // ロード状態の場合
              NullaryCommand.hardUnloadSubtree()
            }

            CurrentState.commit()
            break
          case '1000MouseButton0':
            event.preventDefault()

            if (isUnloaded) {
              // アンロード状態の場合
              NullaryCommand.loadItem()
            } else {
              // ロード状態の場合
              NullaryCommand.hardUnloadItem()
            }

            CurrentState.commit()
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
        />`
      : html`<div
          class=${classMap({
            'item-tree-web-page-content_favicon': true,
            'default-favicon': true,
            'unloaded-item': viewModel.isUnloaded,
          })}
          @click=${viewModel.onClickFavicon}
        />`}
    ${!viewModel.labels.isEmpty()
      ? html`<div class="item-tree-web-page-content_labels">
          ${viewModel.labels.map((label) => LabelView({text: label}))}
        </div>`
      : html`<div class="grid-empty-cell"></div>`}
    <div
      class=${classMap({
        'item-tree-web-page-content_title': true,
        'unloaded-item': viewModel.isUnloaded,
        unread: viewModel.isUnread,
      })}
      title=${viewModel.title}
      @click=${viewModel.onClickTitle}
    >
      ${viewModel.title}
    </div>
    ${viewModel.isAudible
      ? html`<div class="item-tree-web-page-content_audible-icon" />`
      : html`<div class="grid-empty-cell"></div>`}
  </div>`
}

export const ItemTreeWebPageContentCss = css`
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --item-tree-favicon-size: 1em;

    /* 未読ウェブページアイテムのタイトルの色 */
    --item-tree-unread-web-page-item-title-color: hsl(240, 50%, 45%);

    /* ウェブページアイテムの音がなっていることを示すアイコン領域（正方形）の一辺の長さ */
    --item-tree-audible-icon-size: 1em;
    /* ウェブページアイテムの音がなっていることを示すアイコンの色 */
    --item-tree-audible-icon-color: hsl(0, 0%, 35%);

    /* アンロード済みウェブページアイテムのopacity */
    --unloaded-web-page-item-opacity: 45%;
  }

  /* ウェブページアイテムのコンテンツ領域のルート */
  .item-tree-web-page-content {
    /* ファビコン、ラベル、タイトル、audibleアイコンを横並びにする */
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のウェブページアイテムのタイトル */
  .grayed-out-item .item-tree-web-page-content_title,
  .grayed-out-item-children .item-tree-web-page-content_title {
    color: var(--grayed-out-item-text-color);
  }

  /* ウェブページアイテムのファビコン */
  .item-tree-web-page-content_favicon {
    width: var(--item-tree-favicon-size);
    height: var(--item-tree-favicon-size);

    /* クリックして操作できることを示す */
    cursor: pointer;
  }
  /* デフォルトファビコン */
  .item-tree-web-page-content_favicon.default-favicon {
    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 40%);
    -webkit-mask-image: url('./default-favicon.svg');
  }

  /* ローディングインジケータ */
  .loading-indicator {
    border-radius: 50%;
    border-top: 4px solid hsl(200, 0%, 30%);
    border-right: 4px solid hsl(200, 0%, 70%);
    border-bottom: 4px solid hsl(200, 0%, 70%);
    border-left: 4px solid hsl(200, 0%, 70%);
    box-sizing: border-box;
    animation: rotation 0.8s infinite linear;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* ウェブページアイテムの音がなっていることを示すアイコン */
  .item-tree-web-page-content_audible-icon {
    width: var(--item-tree-audible-icon-size);
    height: var(--item-tree-audible-icon-size);

    background: var(--item-tree-audible-icon-color);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  /* ウェブページアイテムのタイトル */
  .item-tree-web-page-content_title {
    cursor: default;

    /*
    ウェブページアイテムのタイトルの折り返しを防ぐための設定。
  
    【折り返しを防ぐ理由】
    (1) ウェブページのタイトルは非常に長い場合もあり、Treeifyウィンドウの横幅が狭い場合は何行も専有して邪魔。
    (2) Chromeはタブ読込中に一瞬だけURLをタイトル扱いする場合がある。
        一般にURLは長い文字列なのでその瞬間だけ折り返しが発生し、画面がガクッと動くような印象を与えてしまう。
    */
    overflow-x: hidden;
    white-space: nowrap;
  }

  /* 未読ウェブページアイテムのタイトルの強調表示 */
  .item-tree-web-page-content_title.unread {
    color: var(--item-tree-unread-web-page-item-title-color);
  }

  /* アンロード済みウェブページアイテムのタイトルのグレーアウト */
  .item-tree-web-page-content_title.unloaded-item {
    filter: opacity(var(--unloaded-web-page-item-opacity));
  }

  /* アンロード済みウェブページアイテムのファビコンのグレーアウト */
  .item-tree-web-page-content_favicon.unloaded-item {
    filter: opacity(var(--unloaded-web-page-item-opacity));
  }
`
