<script lang="ts">
  import PageTreeNode from './PageTreeNode.svelte'
  import {PageTreeNodeViewModel} from './PageTreeNodeView'

  type PageTreeViewModel = {
    pageTreeRootNodeViewModel: PageTreeNodeViewModel
  }

  export let viewModel: PageTreeViewModel
</script>

<div class="page-tree">
  <PageTreeNode viewModel={viewModel.pageTreeRootNodeViewModel} />
</div>

<style>
  :root {
    /* ページツリーのテキスト全般に適用されるline-height */
    --page-tree-line-height: 1.65;

    /* フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する */
    --page-tree-calculated-line-height: calc(1em * var(--item-tree-line-height));
  }

  .page-tree {
    font-size: 15px;
    line-height: var(--page-tree-line-height);

    /* ある程度大きめに余白をとっておかないと、下端付近でのスクロールの余裕がなくて窮屈になる */
    padding-bottom: 150px;
  }
</style>
