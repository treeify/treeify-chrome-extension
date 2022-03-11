<script lang="ts">
  import { dragItem } from 'src/TreeifyTab/View/dragAndDrop'
  import GridEmptyCell from 'src/TreeifyTab/View/GridEmptyCell.svelte'
  import LoadingIndicator from 'src/TreeifyTab/View/LoadingIndicator.svelte'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaWebPageContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaWebPageContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaWebPageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
  const nbsp = String.fromCharCode(160)
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
          <img
            class="main-area-web-page-content_favicon"
            src={props.faviconUrl}
            alt=""
            title={props.tooltipText}
          />
        {:else if !props.isLoading}
          <div class="main-area-web-page-content_default-favicon" title={props.tooltipText} />
        {/if}
        {#if props.isLoading}
          <LoadingIndicator title={props.tooltipText} />
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
      <!-- 空文字列の場合レイアウト崩れを防ぐためにnbspを入れる -->
      {props.title || nbsp}
    </div>
    {#if props.isAudible}
      <div class="main-area-web-page-content_audible-icon" />
    {:else}
      <GridEmptyCell />
    {/if}
  </div>
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

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

    @include common.flex-center;

    cursor: pointer;
  }

  .main-area-web-page-content_favicon-wrapper {
    @include common.size(common.toIntegerPx(1em));
    @include common.pseudo-ripple-effect(transparent);

    .discarded & {
      filter: opacity(75%);
    }

    .tab-closed & {
      filter: opacity(55%);
    }
  }

  .main-area-web-page-content_favicon {
    @include common.size(100%);
    @include common.absolute-center;
    object-fit: contain;
  }

  .main-area-web-page-content_default-favicon {
    @include common.size(100%);
    @include common.absolute-center;

    @include common.default-favicon;
  }

  // ウェブページ項目の音がなっていることを示すアイコン
  .main-area-web-page-content_audible-icon {
    @include common.size(common.toIntegerPx(1em));
    @include common.icon(oklch(45% 0 0), url('audible.svg'));

    margin-left: common.toIntegerPx(0.2em);
  }

  // ウェブページ項目のタイトル
  .main-area-web-page-content_title {
    cursor: default;
    user-select: none;

    padding-block: var(--main-area-node-content-area-vertical-padding);

    overflow-x: hidden;
    white-space: nowrap;

    &.discarded {
      color: var(--discarded-web-page-item-title-color);
    }

    &.tab-closed {
      color: var(--tab-closed-web-page-item-title-color);
    }

    // 未読ウェブページ項目のタイトルの強調表示
    &.unread {
      color: var(--unread-web-page-item-title-color);

      &.discarded {
        color: var(--unread-discarded-web-page-item-title-color);
      }

      &.tab-closed {
        color: var(--unread-tab-closed-web-page-item-title-color);
      }

      .completed &,
      .completed-children & {
        color: var(--unread-completed-web-page-item-title-color);
      }
    }

    .completed &,
    .completed-children & {
      color: var(--completed-item-text-color);
    }
  }
</style>
