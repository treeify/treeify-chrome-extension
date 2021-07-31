<script lang="ts">
  import {WebPageItemContentProps} from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'

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

<style global lang="scss">
  .web-page-item-content {
    display: flex;
    align-items: center;
  }

  .web-page-item-content_favicon {
    width: 1em;
    aspect-ratio: 1;
  }
</style>
