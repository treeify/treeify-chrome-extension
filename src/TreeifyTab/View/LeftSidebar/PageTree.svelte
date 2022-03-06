<script lang="ts">
  import PageTreeNode from 'src/TreeifyTab/View/LeftSidebar/PageTreeNode.svelte'
  import { PageTreeProps } from 'src/TreeifyTab/View/LeftSidebar/PageTreeProps'

  export let props: PageTreeProps
</script>

<div class="page-tree_root">
  <PageTreeNode props={props.pageTreeRootNodeProps} />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // ページツリーのテキスト全般に適用されるline-height
    --page-tree-line-height: #{common.toIntegerPx(1.5em)};

    // フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する
    --page-tree-calculated-line-height: calc(
      var(--page-tree-line-height) + 2 * var(--page-tree-node-content-area-vertical-padding)
    );
  }

  .page-tree_root {
    line-height: var(--page-tree-line-height);

    padding: common.toIntegerPx(0.8em) common.toIntegerPx(0.3em) common.toIntegerPx(3em)
      common.toIntegerPx(0.7em);
  }
</style>
