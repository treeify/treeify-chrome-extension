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

<style global lang="scss">
  :root {
    // ウェブページ項目のファビコン領域（正方形）の一辺の長さ
    --main-area-favicon-size: 1em;

    // 未読ウェブページ項目のタイトルの色。lch(35.0%, 134.0, 160.4)相当
    --main-area-unread-web-page-item-title-color: #005f3e;

    // ウェブページ項目の音がなっていることを示すアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --main-area-audible-icon-color: #6a6a6a;
  }

  // アンロード済みウェブページ項目のopacity
  $soft-unloaded-web-page-item-opacity: 75%;
  $hard-unloaded-web-page-item-opacity: 55%;

  // ウェブページ項目のコンテンツ領域のルート
  .main-area-web-page-content {
    // フォーカス時の枠線を非表示
    outline: 0 solid transparent;
  }

  .main-area-web-page-content_body {
    // ファビコン、ラベル、タイトル、audibleアイコンを横並びにする
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }

  // グレーアウト状態のウェブページ項目のタイトル
  .grayed-out .main-area-web-page-content_title,
  .grayed-out-children .main-area-web-page-content_title {
    color: var(--grayed-out-item-text-color);
  }

  // ウェブページ項目のファビコン
  .main-area-web-page-content_favicon {
    width: var(--main-area-favicon-size);
    aspect-ratio: 1;

    position: relative;

    // クリックして操作できることを示す
    cursor: pointer;

    > * {
      width: var(--main-area-favicon-size);
      aspect-ratio: 1;
    }

    // 疑似リップルエフェクトの終了状態
    &::after {
      content: '';

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s, width 0.5s, height 0.5s;

      border-radius: 50%;

      // lch(50.0%, 0.0, 0.0)相当
      background: #777777;
    }

    // 疑似リップルエフェクトの開始状態
    &:active::after {
      width: 0;
      height: 0;
      opacity: 0.5;
      transition: opacity 0s, width 0s, height 0s;
    }
  }

  // ローディングインジケータ
  .loading-indicator {
    border-radius: 50%;
    // lch(30.0%, 0.0, 0.0)相当
    border-top: 4px solid #474747;
    // lch(70.0%, 0.0, 0.0)相当
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

  // ウェブページ項目の音がなっていることを示すアイコン
  .main-area-web-page-content_audible-icon {
    width: 1em;
    aspect-ratio: 1;

    background: var(--main-area-audible-icon-color);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  // ウェブページ項目のタイトル
  .main-area-web-page-content_title {
    cursor: default;
    user-select: none;

    overflow-x: hidden;
    white-space: nowrap;

    // 未読ウェブページ項目のタイトルの強調表示
    &.unread {
      color: var(--main-area-unread-web-page-item-title-color);
    }

    // アンロード済みウェブページ項目のタイトルのグレーアウト
    &.soft-unloaded-item {
      filter: opacity($soft-unloaded-web-page-item-opacity);
    }

    &.hard-unloaded-item {
      filter: opacity($hard-unloaded-web-page-item-opacity);
    }
  }

  // アンロード済みウェブページ項目のファビコンのグレーアウト
  .main-area-web-page-content_favicon.soft-unloaded-item > * {
    filter: opacity($soft-unloaded-web-page-item-opacity);
  }
  .main-area-web-page-content_favicon.hard-unloaded-item > * {
    filter: opacity($hard-unloaded-web-page-item-opacity);
  }
</style>
