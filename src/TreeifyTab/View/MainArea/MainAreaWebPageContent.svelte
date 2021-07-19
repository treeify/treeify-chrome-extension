<script lang="ts">
  import Cite from '../Cite.svelte'
  import {dragItem} from '../dragAndDrop'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaWebPageContentProps} from './MainAreaWebPageContentProps'
  
  export let props: MainAreaWebPageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-web-page-content" {id} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-web-page-content_body">
    <div
      class="main-area-web-page-content_favicon"
      class:soft-unloaded-item={props.isSoftUnloaded}
      class:hard-unloaded-item={props.isHardUnloaded}
      on:mousedown={props.onClickFavicon}
    >
      {#if props.isLoading}
        <div class="loading-indicator" />
      {:else if props.faviconUrl.length > 0}
        <img src={props.faviconUrl} />
      {:else}
        <div class="default-favicon" />
      {/if}
    </div>

    <div
      class="main-area-web-page-content_title"
      class:soft-unloaded-item={props.isSoftUnloaded}
      class:hard-unloaded-item={props.isHardUnloaded}
      class:unread={props.isUnread}
      title={props.title}
      on:click={props.onClickTitle}
      use:dragItem={props.itemPath}
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

    /* 未読ウェブページアイテムのタイトルの色。lch(35.0%, 134.0, 160.4)相当 */
    --main-area-unread-web-page-item-title-color: #005f3e;

    /* ウェブページアイテムの音がなっていることを示すアイコン領域（正方形）の一辺の長さ */
    --main-area-audible-icon-size: 1em;
    /* ウェブページアイテムの音がなっていることを示すアイコンの色。lch(35.0%, 0.0, 0.0)相当 */
    --main-area-audible-icon-color: #525252;

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

    position: relative;

    /* クリックして操作できることを示す */
    cursor: pointer;
  }
  .main-area-web-page-content_favicon > * {
    width: var(--main-area-favicon-size);
    height: var(--main-area-favicon-size);
  }
  /* 疑似リップルエフェクトの終了状態 */
  .main-area-web-page-content_favicon::after {
    content: '';

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s, width 0.5s, height 0.5s;

    border-radius: 50%;

    /* lch(50.0%, 0.0, 0.0)相当 */
    background: #777777;
  }
  /* 疑似リップルエフェクトの開始状態 */
  .main-area-web-page-content_favicon:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* ローディングインジケータ */
  .loading-indicator {
    border-radius: 50%;
    /* lch(30.0%, 0.0, 0.0)相当 */
    border-top: 4px solid #474747;
    /* lch(70.0%, 0.0, 0.0)相当 */
    border-right: 4px solid #ababab;
    border-bottom: 4px solid #ababab;
    border-left: 4px solid #ababab;
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
    user-select: none;

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
  .main-area-web-page-content_favicon.soft-unloaded-item > * {
    filter: opacity(var(--soft-unloaded-web-page-item-opacity));
  }
  .main-area-web-page-content_favicon.hard-unloaded-item > * {
    filter: opacity(var(--hard-unloaded-web-page-item-opacity));
  }
</style>
