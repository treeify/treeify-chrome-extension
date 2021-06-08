<script lang='ts'>
  import Color from 'color'
  import {List} from 'immutable'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import {classMap} from '../createElement'
  import PageTreeBulletAndIndent from './PageTreeBulletAndIndent.svelte'
  import {PageTreeBulletAndIndentViewModel} from './PageTreeBulletAndIndentView'
  import PageTreeContent from './PageTreeContent.svelte'
  import {PageTreeContentViewModel} from './PageTreeContentView'
  import PageTreeNode from './PageTreeNode.svelte'

  export type PageTreeNodeViewModel = {
    bulletAndIndentViewModel: PageTreeBulletAndIndentViewModel
    contentViewModel: PageTreeContentViewModel
    childNodeViewModels: List<PageTreeNodeViewModel>
    isActivePage: boolean
    isRoot: boolean
    footprintRank: integer | undefined
    footprintCount: integer
    onClickContentArea: () => void
    onClickCloseButton: () => void
    onDragOver: (event: DragEvent) => void
    onDrop: (event: DragEvent) => void
  }

  export let viewModel: PageTreeNodeViewModel

  function calculateFootprintColor(
    footprintRank: integer | undefined,
    footprintCount: integer,
  ): Color | undefined {
    if (footprintRank === undefined) return undefined

    const strongestColor = CssCustomProperty.getColor('--page-tree-strongest-footprint-color')
    const weakestColor = CssCustomProperty.getColor('--page-tree-weakest-footprint-color')

    if (footprintCount === 1) {
      return strongestColor
    }

    // 線形補間する
    const ratio = footprintRank / (footprintCount - 1)
    return strongestColor.mix(weakestColor, ratio)
  }

  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const footprintLayerStyle =
    footprintColor !== undefined ? `background-color: ${footprintColor}` : ''
</script>

<div class="page-tree-node">
  {#if viewModel.isRoot}
    <div class="page-tree-node_bullet-and-indent-area">
      <PageTreeBulletAndIndent viewModel={viewModel.bulletAndIndentViewModel}/>
    </div>
  {:else }
    <div class="grid-empty-cell"></div>
  {/if}
  <div class="page-tree-node_body-and-children-area">
    <div class="page-tree-node_footprint-layer" style={footprintLayerStyle}>
      <div
        class={classMap({
              'page-tree-node_body-area': true,
              'active-page': viewModel.isActivePage,
            })}
      >
        <div
          class="page-tree-node_content-area"
          on:click={viewModel.onClickContentArea}
          on:dragover={viewModel.onDragOver}
          on:drop={viewModel.onDrop}
        >
          <PageTreeContent viewModel={viewModel.contentViewModel}/>
        </div>
        <div class="page-tree-node_close-button" on:click={viewModel.onClickCloseButton}></div>
      </div>
    </div>
    <div class="page-tree-node_children-area">
      {#each viewModel.childNodeViewModels.toArray() as childNodeViewModel}
        <PageTreeNode viewModel={childNodeViewModel}/>
      {/each}
    </div>
  </div>
</div>

<style>
    :root {
        /* ページツリーの項目のマウスホバー時の背景色 */
        --page-tree-hover-item-background-color: hsl(0, 0%, 95%);

        /* ページツリーのアクティブページの背景色 */
        --page-tree-active-page-background-color: hsl(0, 0%, 90%);

        /* 最も新しい足跡の色（線形補間の一端） */
        --page-tree-strongest-footprint-color: hsl(0, 90%, 96%);
        /* 最も古い足跡の色（線形補間の一端） */
        --page-tree-weakest-footprint-color: hsl(60, 90%, 96%);

        /* 閉じるボタンのサイズ（正方形の一辺の長さ） */
        --page-tree-close-button-size: 1.1em;
    }

    .page-tree-node {
        /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
    }

    /* ページツリーの各ノードのコンテンツ領域と右端のボタン類を並べた領域 */
    .page-tree-node_body-area {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
    }
    .page-tree-node_body-area.active-page {
        /* アクティブページの強調表示 */
        background: var(--page-tree-active-page-background-color);
    }

    .page-tree-node_body-area:hover {
        background: var(--page-tree-hover-item-background-color);
    }

    .page-tree-node_content-area {
        cursor: default;

        /* ページツリーではテキストは折り返さない */
        overflow-x: hidden;
        white-space: nowrap;
    }

    .page-tree-node_close-button {
        width: var(--page-tree-close-button-size);
        height: var(--page-tree-close-button-size);

        /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
        background: hsl(0, 0%, 20%);
        -webkit-mask-image: url('close-icon2.svg');

        /* マウスホバー時にのみ表示 */
        display: none;

        /* ボタンであることを示す */
        cursor: pointer;
    }
    .page-tree-node_body-area:hover .page-tree-node_close-button {
        /* マウスホバー時にのみ表示 */
        display: initial;
    }
</style>
