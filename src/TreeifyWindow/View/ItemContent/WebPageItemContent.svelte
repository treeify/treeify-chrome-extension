<script lang="ts">
  import {WebPageItemContentProps} from 'src/TreeifyWindow/View/ItemContent/WebPageItemContentProps'

  export let props: WebPageItemContentProps
</script>

<div class="web-page-item-content">
  {#if props.faviconUrl.length > 0}
    <img class="web-page-item-content_favicon" src={props.faviconUrl} />
  {:else}
    <div class="web-page-item-content_favicon default-favicon" />
  {/if}
  <span class="web-page-item-content_title">{props.title}</span>
</div>

<style>
  :root {
    /* ファビコン表示領域（正方形）の一辺の長さ */
    --web-page-item-content-favicon-size: 1em;
  }

  .web-page-item-content {
    display: flex;
    align-items: center;
  }

  .web-page-item-content_favicon {
    width: var(--web-page-item-content-favicon-size);
    height: var(--web-page-item-content-favicon-size);
  }
</style>
