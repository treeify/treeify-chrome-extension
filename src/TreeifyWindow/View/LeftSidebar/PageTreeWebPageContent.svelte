<script lang="ts">
  import {ItemType} from '../../basicType'

  type PageTreeWebPageContentViewModel = {
    itemType: ItemType.WEB_PAGE
    title: string
    faviconUrl: string
  }

  export let viewModel: PageTreeWebPageContentViewModel
</script>

<div class="page-tree-web-page-content">
  <img class="page-tree-web-page-content_favicon" src="LeftSidebar.svelte" draggable="false" />
  <div class="page-tree-web-page-content_title">{viewModel.title}</div>
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
