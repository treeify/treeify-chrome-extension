<script lang="ts">
  import {LeftSidebarProps} from './LeftSidebarProps'
  import PageTree from './PageTree.svelte'

  export let props: LeftSidebarProps
</script>

<aside class="left-sidebar" class:floating={props.isFloating}>
  <PageTree props={props.pageTreeProps} />
</aside>

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
    z-index: 10;
  }
</style>
