<script lang='ts'>
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {ItemPath} from '../../Internal/ItemPath'
  import {classMap} from '../createElement'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export type ItemTreeWebPageContentViewModel = {
    itemPath: ItemPath
    itemType: ItemType.WEB_PAGE
    labels: List<string>
    title: string
    faviconUrl: string
    isLoading: boolean
    isSoftUnloaded: boolean
    isHardUnloaded: boolean
    isUnread: boolean
    isAudible: boolean
    onFocus: (event: FocusEvent) => void
    onClickTitle: (event: MouseEvent) => void
    onClickFavicon: (event: MouseEvent) => void
    onDragStart: (event: DragEvent) => void
  }

  export let viewModel: ItemTreeWebPageContentViewModel

  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
</script>

<div
  class="item-tree-web-page-content"
  id={id}
  tabindex="0"
  on:focus={viewModel.onFocus}
>
  {#if viewModel.isLoading}
    <div
      class="item-tree-web-page-content_favicon loading-indicator"
      on:click={viewModel.onClickFavicon}></div>
  {:else if viewModel.faviconUrl.length > 0}
    <img
      class={classMap({
        'item-tree-web-page-content_favicon': true,
        'soft-unloaded-item': viewModel.isSoftUnloaded,
        'hard-unloaded-item': viewModel.isHardUnloaded,
      })}
      src={viewModel.faviconUrl}
      on:click={viewModel.onClickFavicon}
    />
  {:else }
    <div
      class={classMap({
      'item-tree-web-page-content_favicon': true,
      'default-favicon': true,
      'soft-unloaded-item': viewModel.isSoftUnloaded,
      'hard-unloaded-item': viewModel.isHardUnloaded,
    })}
      on:click={viewModel.onClickFavicon}></div>
  {/if}

  {#if !viewModel.labels.isEmpty()}
    <div class="item-tree-web-page-content_labels">
      {#each viewModel.labels as label}
        <Label viewModel={{text: label}} />
      {/each}
    </div>
  {:else }
    <div class="grid-empty-cell"></div>
  {/if}
  <div
    class={classMap({
        'item-tree-web-page-content_title': true,
        'soft-unloaded-item': viewModel.isSoftUnloaded,
        'hard-unloaded-item': viewModel.isHardUnloaded,
        unread: viewModel.isUnread,
      })}
    title={viewModel.title}
    draggable="true"
    on:click={viewModel.onClickTitle}
    on:dragstart={viewModel.onDragStart}
  >
    {viewModel.title}
  </div>
  {#if viewModel.isAudible}
    <div class="item-tree-web-page-content_audible-icon"></div>
  {:else }
    <div class="grid-empty-cell"></div>
  {/if}
</div>

<style>
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
        --soft-unloaded-web-page-item-opacity: 75%;
        --hard-unloaded-web-page-item-opacity: 55%;
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
    .grayed-out .item-tree-web-page-content_title,
    .grayed-out-children .item-tree-web-page-content_title {
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
    on:keyframes rotation {
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
    .item-tree-web-page-content_title.soft-unloaded-item {
        filter: opacity(var(--soft-unloaded-web-page-item-opacity));
    }
    .item-tree-web-page-content_title.hard-unloaded-item {
        filter: opacity(var(--hard-unloaded-web-page-item-opacity));
    }

    /* アンロード済みウェブページアイテムのファビコンのグレーアウト */
    .item-tree-web-page-content_favicon.soft-unloaded-item {
        filter: opacity(var(--soft-unloaded-web-page-item-opacity));
    }
    .item-tree-web-page-content_favicon.hard-unloaded-item {
        filter: opacity(var(--hard-unloaded-web-page-item-opacity));
    }
</style>
