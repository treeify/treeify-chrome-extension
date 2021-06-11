<script context="module" lang="ts">
  import {get, Readable} from 'svelte/store'
  import {ItemId} from '../../basicType'
  import {Derived} from '../../Internal/Derived'
  import {Internal} from '../../Internal/Internal'

  export function createPageTreeWebPageContentProps(itemId: ItemId) {
    return {
      title: Derived.getWebPageItemTitle(itemId),
      faviconUrl: get(Internal.instance.state.webPageItems[itemId].faviconUrl),
    }
  }
</script>

<script lang="ts">
  export let title: Readable<string>
  export let faviconUrl: string
</script>

<div class="page-tree-web-page-content">
  <img class="page-tree-web-page-content_favicon" src="LeftSidebar.svelte" draggable="false" />
  <div class="page-tree-web-page-content_title">{$title}</div>
</div>

<style>
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --page-tree-favicon-size: 1em;
  }

  .page-tree-web-page-content {
    /* ファビコンとタイトルを横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
  }

  .page-tree-web-page-content_favicon {
    width: var(--page-tree-favicon-size);
    height: var(--page-tree-favicon-size);
  }
</style>
