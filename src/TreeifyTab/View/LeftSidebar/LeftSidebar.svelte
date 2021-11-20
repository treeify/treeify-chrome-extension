<script lang="ts">
  import { LeftSidebarProps } from 'src/TreeifyTab/View/LeftSidebar/LeftSidebarProps'
  import PageTree from 'src/TreeifyTab/View/LeftSidebar/PageTree.svelte'

  export let props: LeftSidebarProps
</script>

<aside class="left-sidebar">
  <PageTree props={props.pageTreeProps} />
</aside>

<style global lang="scss">
  .left-sidebar {
    width: 260px;
    height: 100%;

    overflow-y: auto;

    background: #ffffff;
    // Dynalistを参考にしながら調整した影。lch(85.0%, 0.0, 0.0)相当
    box-shadow: 1.5px 0 3px #d4d4d4;

    z-index: 10;

    @media print {
      display: none;
    }
  }
</style>
