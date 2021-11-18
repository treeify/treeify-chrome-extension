<script lang="ts">
  import { WebPageItemContentProps } from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div class="web-page-item-content">
  {#if props.faviconUrl.length > 0}
    <img
      class="web-page-item-content_favicon"
      class:discarded={props.isDiscarded}
      class:tab-closed={props.isTabClosed}
      src={props.faviconUrl}
    />
  {:else}
    <div
      class="web-page-item-content_favicon default-favicon"
      class:discarded={props.isDiscarded}
      class:tab-closed={props.isTabClosed}
    />
  {/if}
  <div
    class="web-page-item-content_title"
    class:discarded={props.isDiscarded}
    class:tab-closed={props.isTabClosed}
    class:unread={props.isUnread}
  >
    {props.title}
  </div>
  {#if props.isAudible}
    <div class="web-page-item-content_audible-icon" />
  {:else}
    <div class="grid-empty-cell" />
  {/if}
</div>

<style global lang="scss">
  .web-page-item-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }

  .web-page-item-content_favicon {
    width: 1em;
    aspect-ratio: 1;

    &.discarded {
      filter: opacity(75%);
    }

    &.tab-closed {
      filter: opacity(55%);
    }
  }

  .web-page-item-content_title {
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
  }

  .web-page-item-content_audible-icon {
    width: 1em;
    aspect-ratio: 1;

    background: var(--main-area-audible-icon-color);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }
</style>
