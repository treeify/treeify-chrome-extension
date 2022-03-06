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

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }
  }

  .web-page-item-content_favicon-area {
    @include common.size(common.em(1));

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
      color: lch(35% 0 0);
    }

    .tab-closed & {
      color: lch(60% 0 0);
    }

    // 未読ウェブページ項目のタイトルの強調表示
    .unread & {
      color: var(--unread-web-page-item-title-color);
    }

    .unread.discarded & {
      color: lch(35% 30 160.4);
    }

    .unread.tab-closed & {
      color: lch(60% 30 160.4);
    }
  }
</style>
