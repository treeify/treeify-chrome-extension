<script lang="ts">
  import PageTree from './PageTree.svelte'
  import {PageTreeViewModel} from './PageTreeView'

  type LeftSidebarViewModel = {
    pageTreeViewModel: PageTreeViewModel
    isFloating: boolean
  }

  export let viewModel: LeftSidebarViewModel
</script>

<aside class="left-sidebar" class:floating={viewModel.isFloating}>
  <PageTree viewModel={viewModel.pageTreeViewModel} />
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
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }
</style>
