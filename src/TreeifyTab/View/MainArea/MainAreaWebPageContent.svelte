<script lang="ts">
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaWebPageContentProps} from './MainAreaWebPageContentProps'
  
  export let props: MainAreaWebPageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-web-page-content" {id} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-web-page-content_body">
    {#if props.isLoading}
      <div
        class="main-area-web-page-content_favicon loading-indicator"
        on:mousedown={props.onClickFavicon}
      />
    {:else if props.faviconUrl.length > 0}
      <img
        class="main-area-web-page-content_favicon"
        class:soft-unloaded-item={props.isSoftUnloaded}
        class:hard-unloaded-item={props.isHardUnloaded}
        src={props.faviconUrl}
        on:mousedown={props.onClickFavicon}
      />
    {:else}
      <div
        class="main-area-web-page-content_favicon default-favicon"
        class:soft-unloaded-item={props.isSoftUnloaded}
        class:hard-unloaded-item={props.isHardUnloaded}
        on:mousedown={props.onClickFavicon}
      />
    {/if}

    <div
      class="main-area-web-page-content_title"
      class:soft-unloaded-item={props.isSoftUnloaded}
      class:hard-unloaded-item={props.isHardUnloaded}
      class:unread={props.isUnread}
      title={props.title}
      draggable="true"
      on:click={props.onClickTitle}
      on:dragstart={props.onDragStart}
    >
      {props.title}
    </div>
    {#if props.isAudible}
      <div class="main-area-web-page-content_audible-icon" />
    {:else}
      <div class="grid-empty-cell" />
    {/if}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --main-area-favicon-size: 1em;

    /* 未読ウェブページアイテムのタイトルの色 */
    --main-area-unread-web-page-item-title-color: hsl(240, 50%, 45%);

    /* ウェブページアイテムの音がなっていることを示すアイコン領域（正方形）の一辺の長さ */
    --main-area-audible-icon-size: 1em;
    /* ウェブページアイテムの音がなっていることを示すアイコンの色 */
    --main-area-audible-icon-color: hsl(0, 0%, 35%);

    /* アンロード済みウェブページアイテムのopacity */
    --soft-unloaded-web-page-item-opacity: 75%;
    --hard-unloaded-web-page-item-opacity: 55%;
  }

  /* ウェブページアイテムのコンテンツ領域のルート */
  .main-area-web-page-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .main-area-web-page-content_body {
    /* ファビコン、ラベル、タイトル、audibleアイコンを横並びにする */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }

  /* グレーアウト状態のウェブページアイテムのタイトル */
  :global(.grayed-out) .main-area-web-page-content_title,
  :global(.grayed-out-children) .main-area-web-page-content_title {
    color: var(--grayed-out-item-text-color);
  }

  /* ウェブページアイテムのファビコン */
  .main-area-web-page-content_favicon {
    width: var(--main-area-favicon-size);
    height: var(--main-area-favicon-size);

    /* クリックして操作できることを示す */
    cursor: pointer;
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
  .main-area-web-page-content_audible-icon {
    width: var(--main-area-audible-icon-size);
    height: var(--main-area-audible-icon-size);

    background: var(--main-area-audible-icon-color);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  /* ウェブページアイテムのタイトル */
  .main-area-web-page-content_title {
    cursor: default;

    overflow-x: hidden;
    white-space: nowrap;
  }

  /* 未読ウェブページアイテムのタイトルの強調表示 */
  .main-area-web-page-content_title.unread {
    color: var(--main-area-unread-web-page-item-title-color);
  }

  /* アンロード済みウェブページアイテムのタイトルのグレーアウト */
  .main-area-web-page-content_title.soft-unloaded-item {
    filter: opacity(var(--soft-unloaded-web-page-item-opacity));
  }
  .main-area-web-page-content_title.hard-unloaded-item {
    filter: opacity(var(--hard-unloaded-web-page-item-opacity));
  }

  /* アンロード済みウェブページアイテムのファビコンのグレーアウト */
  .main-area-web-page-content_favicon.soft-unloaded-item {
    filter: opacity(var(--soft-unloaded-web-page-item-opacity));
  }
  .main-area-web-page-content_favicon.hard-unloaded-item {
    filter: opacity(var(--hard-unloaded-web-page-item-opacity));
  }
</style>
