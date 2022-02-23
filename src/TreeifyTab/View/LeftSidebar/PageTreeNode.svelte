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
        on:contextmenu={props.onContentAreaContextMenu}
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

    // 最も新しい足跡の色（線形補間の一端）
    --page-tree-strongest-footprint-color: lch(97.5% 134 40.4);
    // 最も古い足跡の色（線形補間の一端）
    --page-tree-weakest-footprint-color: #ffffff;
    // 足跡表示数のパラメータ。
    // CSSではなくJSから参照する特殊なCSS変数。
    // 見た目に関する値なのでカスタムCSSで設定できるようCSS変数として定義した。
    --page-tree-footprint-count-exponent: 0.6;
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
      background: var(--selected-item-background-default-color);
    }

    &:hover {
      background: var(--item-hover-background-default-color);
    }
  }

  // ウェブページ項目の音がなっていることを示すアイコン
  .page-tree-node_audible-icon {
    @include common.square(1em);

    @include common.icon(lch(60% 0 0), url('audible.svg'));

    margin-left: 0.2em;
  }

  .page-tree-node_right-button-area {
    @include common.square(1.5em);
  }

  .page-tree-node_tabs-count-button {
    @include common.circle(100%);

    @include common.pseudo-ripple-effect(lch(90% 0 0));

    font-size: 97%;
  }

  .page-tree-node_tabs-count {
    @include common.absolute-center;

    color: lch(40% 0 0);
  }

  .page-tree-node_close-button {
    @include common.circle(100%);
    @include common.pseudo-ripple-effect(lch(90% 0 0));

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.square(1.3em);
      @include common.absolute-center;

      @include common.icon(lch(50% 0 0), url('close-circle.svg'));
    }

    .page-tree-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }
  }
</style>
