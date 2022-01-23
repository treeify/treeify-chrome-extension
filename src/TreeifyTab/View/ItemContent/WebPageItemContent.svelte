<script lang="ts">
  import { WebPageItemContentProps } from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div
  class="web-page-item-content_root"
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
  }

  .web-page-item-content_favicon-area {
    @include common.square(1em);

    .discarded & {
      filter: opacity(75%);
    }

    .tab-closed & {
      filter: opacity(55%);
    }
  }

  .web-page-item-content_favicon {
    @include common.square(100%);
    object-fit: contain;
  }

  .web-page-item-content_default-favicon {
    @include common.square(100%);
    @include common.default-favicon;
  }

  .web-page-item-content_title {
    overflow-x: hidden;
    white-space: nowrap;

    .discarded & {
      // lch(35.0%, 0.0, 0.0)相当
      color: #525252;
    }

    .tab-closed & {
      // lch(60.0%, 0.0, 0.0)相当
      color: #919191;
    }

    // 未読ウェブページ項目のタイトルの強調表示
    .unread & {
      color: var(--main-area-unread-web-page-item-title-color);
    }

    .unread.discarded & {
      // lch(35.0%, 30.0, 160.4)相当
      color: #1a5d41;
    }

    .unread.tab-closed & {
      // lch(60.0%, 30.0, 160.4)相当
      color: #5d9e7e;
    }
  }
</style>
