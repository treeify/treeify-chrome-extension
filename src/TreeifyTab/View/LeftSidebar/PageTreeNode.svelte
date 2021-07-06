<script lang="ts">
  import Color from 'color'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import PageTreeBulletAndIndent from './PageTreeBulletAndIndent.svelte'
  import PageTreeNode from './PageTreeNode.svelte'
  import {PageTreeNodeProps} from './PageTreeNodeProps'

  export let props: PageTreeNodeProps

  function calculateFootprintColor(
    footprintRank: integer | undefined,
    footprintCount: integer
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

  $: footprintColor = calculateFootprintColor(props.footprintRank, props.footprintCount)
  $: footprintLayerStyle = footprintColor !== undefined ? `background-color: ${footprintColor}` : ''
</script>

<div class="page-tree-node">
  {#if props.isRoot}
    <div class="grid-empty-cell" />
  {:else}
    <div class="page-tree-node_bullet-and-indent-area">
      <PageTreeBulletAndIndent props={props.bulletAndIndentProps} />
    </div>
  {/if}
  <div class="page-tree-node_body-and-children-area">
    <div class="page-tree-node_body-area">
      <div class="page-tree-node_footprint-layer" style={footprintLayerStyle}>
        <div
          class="page-tree-node_content-area"
          class:active-page={props.isActivePage}
          on:mousedown={props.onClickContentArea}
          on:dragover={props.onDragOver}
          on:drop={props.onDrop}
        >
          <ItemContent props={props.contentProps} />
        </div>
      </div>
      {#if props.isAudible}
        <div class="page-tree-node_audible-icon" />
      {:else}
        <div class="grid-empty-cell" />
      {/if}
      {#if props.tabsCount > 0}
        <div class="page-tree-node_tabs-count-button" on:mousedown={props.onClickTabsCount}>
          <div class="page-tree-node_tabs-count">{Math.min(99, props.tabsCount)}</div>
        </div>
      {:else}
        <div class="page-tree-node_close-button" on:mousedown={props.onClickCloseButton} />
      {/if}
    </div>
    <div class="page-tree-node_children-area">
      {#each props.childNodePropses.toArray() as childNodeProps}
        <PageTreeNode props={childNodeProps} />
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

    /* audibleタブを含むことを示すアイコンのサイズ（正方形の一辺の長さ） */
    --page-tree-audible-icon-size: 1em;

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
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
  }

  .page-tree-node_content-area {
    cursor: default;

    /* ページツリーではテキストは折り返さない */
    overflow-x: hidden;
    white-space: nowrap;
  }
  .page-tree-node_content-area.active-page {
    /* アクティブページの強調表示 */
    background: var(--page-tree-active-page-background-color);
  }

  .page-tree-node_content-area:hover {
    background: var(--page-tree-hover-item-background-color);
  }

  /* ウェブページアイテムの音がなっていることを示すアイコン */
  .page-tree-node_audible-icon {
    width: var(--page-tree-audible-icon-size);
    height: var(--page-tree-audible-icon-size);

    background: hsl(0, 0%, 35%);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  .page-tree-node_tabs-count-button {
    width: var(--page-tree-close-button-size);
    height: var(--page-tree-close-button-size);

    position: relative;

    border-radius: 50%;
    cursor: pointer;
  }
  .page-tree-node_tabs-count-button:hover {
    background: hsl(0, 0%, 90%);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
  .page-tree-node_tabs-count-button::after {
    content: '';

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s, width 0.5s, height 0.5s;

    border-radius: 50%;

    background: hsl(0, 0%, 50%);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの開始状態 */
  .page-tree-node_tabs-count-button:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  .page-tree-node_tabs-count {
    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    color: hsl(0, 0%, 40%);
  }

  .page-tree-node_close-button {
    width: var(--page-tree-close-button-size);
    height: var(--page-tree-close-button-size);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 20%);
    -webkit-mask-image: url('close-icon2.svg');

    /* マウスホバー時にのみ表示 */
    visibility: hidden;

    /* ボタンであることを示す */
    cursor: pointer;
  }
  .page-tree-node_body-area:hover .page-tree-node_close-button {
    /* マウスホバー時にのみ表示 */
    visibility: visible;
  }
</style>
