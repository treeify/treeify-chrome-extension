<script lang="ts">
  import {LeftSidebarProps} from './LeftSidebarProps'
  import PageTree from './PageTree.svelte'

  export let props: LeftSidebarProps
</script>

<aside class="left-sidebar">
  <PageTree props={props.pageTreeProps} />
</aside>

<style>
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: #f9f9f9;

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;
  }

  .left-sidebar {
    width: var(--left-sidebar-width);
    height: 100%;

    overflow-y: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影。lch(85.0%, 0.0, 0.0)相当 */
    box-shadow: 1.5px 0 3px #d4d4d4;
  }
</style>
