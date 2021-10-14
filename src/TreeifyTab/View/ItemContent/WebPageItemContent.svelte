<script lang="ts">
  import {WebPageItemContentProps} from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div class="web-page-item-content">
  {#if props.faviconUrl.length > 0}
    <img
      class="web-page-item-content_favicon"
      class:soft-unloaded-item={props.isSoftUnloaded}
      class:hard-unloaded-item={props.isHardUnloaded}
      src={props.faviconUrl}
    />
  {:else}
    <div
      class="web-page-item-content_favicon default-favicon"
      class:soft-unloaded-item={props.isSoftUnloaded}
      class:hard-unloaded-item={props.isHardUnloaded}
    />
  {/if}
  <span
    class="web-page-item-content_title"
    class:soft-unloaded-item={props.isSoftUnloaded}
    class:hard-unloaded-item={props.isHardUnloaded}
    class:unread={props.isUnread}>{props.title}</span
  >
</div>

<style global lang="scss">
  .web-page-item-content {
    display: flex;
    align-items: center;
  }

  .web-page-item-content_favicon {
    width: 1em;
    aspect-ratio: 1;

    &.soft-unloaded-item {
      filter: opacity(75%);
    }
    &.hard-unloaded-item {
      filter: opacity(55%);
    }
  }

  .web-page-item-content_title {
    &.soft-unloaded-item {
      // lch(35.0%, 0.0, 0.0)相当
      color: #525252;
    }

    &.hard-unloaded-item {
      // lch(60.0%, 0.0, 0.0)相当
      color: #919191;
    }

    // 未読ウェブページ項目のタイトルの強調表示
    &.unread {
      color: var(--main-area-unread-web-page-item-title-color);

      &.soft-unloaded-item {
        // lch(35.0%, 30.0, 160.4)相当
        color: #1a5d41;
      }

      &.hard-unloaded-item {
        // lch(60.0%, 30.0, 160.4)相当
        color: #5d9e7e;
      }
    }
  }
</style>
