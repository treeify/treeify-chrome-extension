<script lang="ts">
  import {WebPageItemContentProps} from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div class="web-page-item-content">
  {#if props.faviconUrl.length > 0}
    <img
      class="web-page-item-content_favicon"
      class:soft-unloaded={props.isSoftUnloaded}
      class:hard-unloaded={props.isHardUnloaded}
      src={props.faviconUrl}
    />
  {:else}
    <div
      class="web-page-item-content_favicon default-favicon"
      class:soft-unloaded={props.isSoftUnloaded}
      class:hard-unloaded={props.isHardUnloaded}
    />
  {/if}
  <div
    class="web-page-item-content_title"
    class:soft-unloaded={props.isSoftUnloaded}
    class:hard-unloaded={props.isHardUnloaded}
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

    &.soft-unloaded {
      filter: opacity(75%);
    }
    &.hard-unloaded {
      filter: opacity(55%);
    }
  }

  .web-page-item-content_title {
    &.soft-unloaded {
      // lch(35.0%, 0.0, 0.0)相当
      color: #525252;
    }

    &.hard-unloaded {
      // lch(60.0%, 0.0, 0.0)相当
      color: #919191;
    }

    // 未読ウェブページ項目のタイトルの強調表示
    &.unread {
      color: var(--main-area-unread-web-page-item-title-color);

      &.soft-unloaded {
        // lch(35.0%, 30.0, 160.4)相当
        color: #1a5d41;
      }

      &.hard-unloaded {
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
