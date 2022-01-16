<script lang="ts">
  import { dragItem } from 'src/TreeifyTab/View/dragAndDrop'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaWebPageContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaWebPageContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaWebPageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-web-page-content_root" {id} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-web-page-content_body">
    <div
      class="main-area-web-page-content_favicon-area"
      class:discarded={props.isDiscarded}
      class:tab-closed={props.isTabClosed}
      on:mousedown={props.onClickFavicon}
    >
      <div class="main-area-web-page-content_favicon-wrapper">
        {#if props.faviconUrl.length > 0}
          <img class="main-area-web-page-content_favicon" src={props.faviconUrl} alt="" />
        {:else if !props.isLoading}
          <div class="main-area-web-page-content_default-favicon" />
        {/if}
        {#if props.isLoading}
          <div class="loading-indicator" />
        {/if}
      </div>
    </div>

    <div
      class="main-area-web-page-content_title"
      class:discarded={props.isDiscarded}
      class:tab-closed={props.isTabClosed}
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
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // ウェブページ項目のファビコン領域（正方形）の一辺の長さ
    --main-area-favicon-size: 1em;

    // 未読ウェブページ項目のタイトルの色。lch(35.0%, 134.0, 160.4)相当
    --main-area-unread-web-page-item-title-color: #005f3e;

    // ウェブページ項目の音がなっていることを示すアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --main-area-audible-icon-color: #6a6a6a;
  }

  // ウェブページ項目のコンテンツ領域のルート
  .main-area-web-page-content_root {
    // フォーカス時の枠線を非表示
    outline: none;
  }

  .main-area-web-page-content_body {
    // ファビコン、ラベル、タイトル、audibleアイコンを横並びにする
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }

  // ウェブページ項目のファビコン
  .main-area-web-page-content_favicon-area {
    // 当たり判定を上下いっぱいまで広げる
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .main-area-web-page-content_favicon-wrapper {
    @include common.square(var(--main-area-favicon-size));
    @include common.pseudo-ripple-effect(transparent);

    .discarded & {
      filter: opacity(75%);
    }

    .tab-closed & {
      filter: opacity(55%);
    }
  }

  .main-area-web-page-content_favicon {
    @include common.square(100%);
    @include common.absolute-center;
    object-fit: contain;
  }

  .main-area-web-page-content_default-favicon {
    @include common.square(100%);
    @include common.absolute-center;

    @include common.default-favicon;
  }

  // ローディングインジケータ
  .loading-indicator {
    @include common.circle(100%);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    border-radius: 50%;
    // lch(30.0%, 0.0, 0.0)相当
    border-top: 3px solid #474747;
    // lch(70.0%, 0.0, 0.0)相当
    border-right: 3px solid #ababab;
    border-bottom: 3px solid #ababab;
    border-left: 3px solid #ababab;
    animation: rotation 0.8s infinite linear;
  }

  @keyframes rotation {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  // ウェブページ項目の音がなっていることを示すアイコン
  .main-area-web-page-content_audible-icon {
    @include common.square(1em);
    @include common.icon(var(--main-area-audible-icon-color), url('./audible.svg'));
  }

  // ウェブページ項目のタイトル
  .main-area-web-page-content_title {
    cursor: default;
    user-select: none;

    padding-block: var(--main-area-node-content-area-vertical-padding);

    overflow-x: hidden;
    white-space: nowrap;

    &.discarded {
      // lch(35.0%, 0.0, 0.0)相当
      color: #525252;
    }

    &.tab-closed {
      // lch(60.0%, 0.0, 0.0)相当
      color: #919191;
    }

    // 未読ウェブページ項目のタイトルの強調表示
    &.unread {
      color: var(--main-area-unread-web-page-item-title-color);

      &.discarded {
        // lch(35.0%, 30.0, 160.4)相当
        color: #1a5d41;
      }

      &.tab-closed {
        // lch(60.0%, 30.0, 160.4)相当
        color: #5d9e7e;
      }
    }

    // 完了状態のウェブページ項目のタイトル
    .completed &,
    .completed-children & {
      color: var(--completed-item-text-color);
    }
  }
</style>
