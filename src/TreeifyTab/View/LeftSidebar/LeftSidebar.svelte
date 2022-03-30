<script lang="ts">
  import { LeftSidebarProps } from 'src/TreeifyTab/View/LeftSidebar/LeftSidebarProps'
  import PageTree from 'src/TreeifyTab/View/LeftSidebar/PageTree.svelte'

  export let props: LeftSidebarProps
</script>

<aside class="left-sidebar_root">
  <PageTree props={props.pageTreeProps} />
</aside>

<style global lang="scss">
  .left-sidebar_root {
    width: 260px;
    min-width: 10vw;
    max-width: 30vw;
    height: 100%;

    overflow-y: auto;

    background: oklch(100% 0 0);
    box-shadow: 0 0 3px oklch(70% 0 0);

    z-index: 10;

    @media print {
      display: none;
    }
  }
</style>
