<script lang="ts">
  import { WebPageItemContentProps } from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div
  class="web-page-item-content_root {props.cssClasses.join(' ')}"
  class:discarded={props.isDiscarded}
  class:tab-closed={props.isTabClosed}
  class:unread={props.isUnread}
>
  <div class="web-page-item-content_favicon-area">
    {#if props.faviconUrl.length > 0}
      <img class="web-page-item-content_favicon" src={props.faviconUrl} alt="" />
    {:else}
      <div class="web-page-item-content_default-favicon" />
    {/if}
  </div>
  <div class="web-page-item-content_title">
    {props.title}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .web-page-item-content_root {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;

    &.completed,
    .completed-children & {
      color: var(--completed-item-text-color);
    }

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }
  }

  .web-page-item-content_favicon-area {
    @include common.size(common.toIntegerPx(1em));

    .discarded & {
      filter: opacity(75%);
    }

    .tab-closed & {
      filter: opacity(55%);
    }
  }

  .web-page-item-content_favicon {
    @include common.size(100%);
    object-fit: contain;
  }

  .web-page-item-content_default-favicon {
    @include common.size(100%);
    @include common.default-favicon;
  }

  .web-page-item-content_title {
    overflow-x: hidden;
    white-space: nowrap;

    .discarded & {
      color: var(--discarded-web-page-item-title-color);
    }

    .tab-closed & {
      color: var(--tab-closed-web-page-item-title-color);
    }

    // 未読ウェブページ項目のタイトルの強調表示
    .unread & {
      color: var(--unread-web-page-item-title-color);
    }

    .unread.discarded & {
      color: var(--unread-discarded-web-page-item-title-color);
    }

    .unread.tab-closed & {
      color: var(--unread-tab-closed-web-page-item-title-color);
    }
  }
</style>
