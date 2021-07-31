<script lang="ts">
  import Color from 'color'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import {onItemDrop} from '../dragAndDrop'
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
          data-item-id={props.itemId}
          on:mousedown={props.onClickContentArea}
          use:onItemDrop={props.onDrop}
        >
          <ItemContent props={props.contentProps} />
          {#if props.isAudible}
            <div class="page-tree-node_audible-icon" />
          {:else}
            <div class="grid-empty-cell" />
          {/if}
        </div>
      </div>
      {#if props.tabsCount > 0}
        <div class="page-tree-node_tabs-count-button" on:mousedown={props.onClickTabsCount}>
          <div class="page-tree-node_tabs-count">{Math.min(99, props.tabsCount)}</div>
        </div>
      {:else}
        <div
          class="page-tree-node_close-button icon-button"
          on:mousedown={props.onClickCloseButton}
        />
      {/if}
    </div>
    <div class="page-tree-node_children-area">
      {#each props.childNodePropses.toArray() as childNodeProps}
        <PageTreeNode props={childNodeProps} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  :root {
    // ページツリーの項目のマウスホバー時の背景色。lch(97.5%, 134.0, 280.4)相当
    --page-tree-hover-item-background-color: #f6f8ff;

    // ページツリーのアクティブページの背景色。lch(95.0%, 134.0, 280.4)相当
    --page-tree-active-page-background-color: #ecf0ff;

    // 最も新しい足跡の色（線形補間の一端）。lch(97.5%, 134.0, 40.4)相当
    --page-tree-strongest-footprint-color: #fff6f3;
    // 最も古い足跡の色（線形補間の一端）
    --page-tree-weakest-footprint-color: #ffffff;
    // 足跡表示数のパラメータ。
    // CSSではなくJSから参照する特殊なCSS変数。
    // 見た目に関する値なのでカスタムCSSで設定できるようCSS変数として定義した。
    --page-tree-footprint-count-exponent: 0.7;

    // 閉じるボタンのサイズ（正方形の一辺の長さ）
    --page-tree-close-button-size: 1.45em;
  }

  .page-tree-node {
    // バレット&インデント領域とボディ&子リスト領域を横に並べる
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);

    user-select: none;
  }

  // ページツリーの各ノードのコンテンツ領域と右端のボタン類を並べた領域
  .page-tree-node_body-area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .page-tree-node_content-area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;

    cursor: default;

    // ページツリーではテキストは折り返さない
    overflow-x: hidden;
    white-space: nowrap;

    &.active-page {
      // アクティブページの強調表示
      background: var(--page-tree-active-page-background-color);
    }

    &:hover {
      background: var(--page-tree-hover-item-background-color);
    }
  }

  // ウェブページ項目の音がなっていることを示すアイコン
  .page-tree-node_audible-icon {
    width: 1em;
    aspect-ratio: 1;

    // lch(35.0%, 0.0, 0.0)相当
    background: #525252;
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  .page-tree-node_tabs-count-button {
    width: var(--page-tree-close-button-size);
    aspect-ratio: 1;

    position: relative;

    border-radius: 50%;
    cursor: pointer;

    &:hover {
      // lch(90.0%, 0.0, 0.0)相当
      background: #e2e2e2;
    }

    // 疑似リップルエフェクトの終了状態
    &::after {
      content: '';

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s, width 0.5s, height 0.5s;

      border-radius: 50%;

      // lch(50.0%, 0.0, 0.0)相当
      background: #777777;
    }

    // 疑似リップルエフェクトの開始状態
    &:active::after {
      width: 0;
      height: 0;
      opacity: 0.5;
      transition: opacity 0s, width 0s, height 0s;
    }
  }

  .page-tree-node_tabs-count {
    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // lch(40.0%, 0.0, 0.0)相当
    color: #5e5e5e;
  }

  .page-tree-node_close-button {
    width: var(--page-tree-close-button-size);
    aspect-ratio: 1;

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      width: 1.1em;
      aspect-ratio: 1;

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      // lch(20.0%, 0.0, 0.0)相当
      background: #303030;
      -webkit-mask: url('close-icon2.svg') no-repeat center;
      -webkit-mask-size: contain;
    }

    .page-tree-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }
  }
</style>
