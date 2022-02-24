<script lang="ts">
  import PageTreeNode from 'src/TreeifyTab/View/LeftSidebar/PageTreeNode.svelte'
  import { PageTreeProps } from 'src/TreeifyTab/View/LeftSidebar/PageTreeProps'

  export let props: PageTreeProps
</script>

<div class="page-tree_root">
  <PageTreeNode props={props.pageTreeRootNodeProps} />
</div>

<style global lang="scss">
  :root {
    // ページツリーのテキスト全般に適用されるline-height
    --page-tree-line-height: 1.5;

    // フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する
    --page-tree-calculated-line-height: calc(
      1em * var(--page-tree-line-height) + 2 * var(--page-tree-node-content-area-vertical-padding)
    );
  }

  .page-tree_root {
    line-height: var(--page-tree-line-height);

    padding: 0.8em 0.3em 3em 0.7em;
  }
</style>
