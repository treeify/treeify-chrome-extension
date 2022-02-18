<script lang="ts">
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import PageTreeBulletAndIndent from 'src/TreeifyTab/View/LeftSidebar/PageTreeBulletAndIndent.svelte'
  import PageTreeNode from 'src/TreeifyTab/View/LeftSidebar/PageTreeNode.svelte'
  import { PageTreeNodeProps } from 'src/TreeifyTab/View/LeftSidebar/PageTreeNodeProps'

  export let props: PageTreeNodeProps

  $: footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--page-tree-strongest-footprint-color',
    '--page-tree-weakest-footprint-color'
  )?.toString()
</script>

<div class="page-tree-node_root" style:--footprint-color={footprintColor ?? 'transparent'}>
  {#if props.isRoot}
    <div class="grid-empty-cell" />
  {:else}
    <div class="page-tree-node_bullet-and-indent-area">
      <PageTreeBulletAndIndent props={props.bulletAndIndentProps} />
    </div>
  {/if}
  <div class="page-tree-node_body-and-children-area">
    <div class="page-tree-node_body-area">
      <div
        class="page-tree-node_content-area"
        class:active-page={props.isActivePage}
        data-item-id={props.itemId}
        on:mousedown={props.onClickContentArea}
      >
        <ItemContent props={props.contentProps} />
        {#if props.isAudible}
          <div class="page-tree-node_audible-icon" />
        {:else}
          <div class="grid-empty-cell" />
        {/if}
      </div>
      <div class="page-tree-node_right-button-area">
        {#if props.tabsCount > 0}
          <div
            class="page-tree-node_tabs-count-button"
            on:mousedown={props.onClickTabsCount}
            on:contextmenu={props.onTabsCountContextMenu}
          >
            <div class="page-tree-node_tabs-count">{Math.min(99, props.tabsCount)}</div>
          </div>
        {:else if !props.isRoot}
          <div class="page-tree-node_close-button" on:mousedown={props.onClickCloseButton} />
        {/if}
      </div>
    </div>
    <div class="page-tree-node_children-area">
      {#each props.childNodePropses as childNodeProps}
        <PageTreeNode props={childNodeProps} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --page-tree-node-content-area-vertical-padding: 0.22em;

    // ページツリーの項目のマウスホバー時の背景色。lch(98%, 134.0, 280.4)相当
    --page-tree-hover-item-background-color: #f7f9ff;

    // ページツリーのアクティブページの背景色。lch(95.0%, 134.0, 280.4)相当
    --page-tree-active-page-background-color: #ecf0ff;

    // 最も新しい足跡の色（線形補間の一端）。lch(97.5%, 134.0, 40.4)相当
    --page-tree-strongest-footprint-color: #fff6f3;
    // 最も古い足跡の色（線形補間の一端）
    --page-tree-weakest-footprint-color: #ffffff;
    // 足跡表示数のパラメータ。
    // CSSではなくJSから参照する特殊なCSS変数。
    // 見た目に関する値なのでカスタムCSSで設定できるようCSS変数として定義した。
    --page-tree-footprint-count-exponent: 0.6;

    // 閉じるボタンのサイズ（正方形の一辺の長さ）
    --page-tree-close-button-size: 1.45em;
  }

  .page-tree-node_root {
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
    padding-block: var(--page-tree-node-content-area-vertical-padding);

    cursor: default;

    // ページツリーではテキストは折り返さない。
    // ウェブページ項目に縦スクロールバーが表示される不具合の対策でyもhiddenにする。
    overflow: hidden;
    white-space: nowrap;

    background-color: var(--footprint-color);

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
    @include common.square(1em);

    // lch(60.0%, 0.0, 0.0)相当
    @include common.icon(#919191, url('audible.svg'));
  }

  .page-tree-node_right-button-area {
    @include common.square(var(--page-tree-close-button-size));
  }

  .page-tree-node_tabs-count-button {
    @include common.circle(100%);

    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);
  }

  .page-tree-node_tabs-count {
    @include common.absolute-center;

    // lch(40.0%, 0.0, 0.0)相当
    color: #5e5e5e;
  }

  .page-tree-node_close-button {
    @include common.circle(100%);
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.square(1.3em);
      @include common.absolute-center;

      // lch(50.0%, 0.0, 0.0)相当
      @include common.icon(#777777, url('close-circle.svg'));
    }

    .page-tree-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }
  }
</style>
