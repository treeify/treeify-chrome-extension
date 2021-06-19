<script lang="ts">
  import {ItemType} from '../../basicType'
  import {ItemContentProps} from './ItemContentProps'
  import TextItemContent from './TextItemContent.svelte'
  import WebPageItemContent from './WebPageItemContent.svelte'

  export let props: ItemContentProps
</script>

{#if props.itemType === ItemType.TEXT}
  <TextItemContent {props} />
{:else if props.itemType === ItemType.WEB_PAGE}
  <WebPageItemContent {props} />
{/if}

<style>
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: hsl(0, 0%, 98%);

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;
  }

  .left-sidebar {
    width: var(--left-sidebar-width);
    height: 100%;

    overflow-y: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 1.5px 0 3px hsl(0, 0%, 85%);
  }

  /* フローティング型の左サイドバー */
  .left-sidebar.floating {
    position: fixed;
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }
</style>
