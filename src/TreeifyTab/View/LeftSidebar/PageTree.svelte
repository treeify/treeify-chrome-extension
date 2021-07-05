<script lang="ts">
  import PageTreeNode from './PageTreeNode.svelte'
  import {PageTreeProps} from './PageTreeProps'

  export let props: PageTreeProps
</script>

<div class="page-tree">
  <PageTreeNode props={props.pageTreeRootNodeProps} />
</div>

<style>
  :root {
    /* ページツリーのテキスト全般に適用されるline-height */
    --page-tree-line-height: 1.65;

    /* フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する */
    --page-tree-calculated-line-height: calc(1em * var(--main-area-line-height));
  }

  .page-tree {
    font-size: 15px;
    line-height: var(--page-tree-line-height);

    padding: 10px 5px 150px 10px;
  }
</style>
