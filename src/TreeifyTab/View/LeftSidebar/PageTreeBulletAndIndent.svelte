<script lang="ts">
  import {PageTreeBulletAndIndentProps, PageTreeBulletState} from './PageTreeBulletAndIndentProps'

  export let props: PageTreeBulletAndIndentProps
</script>

<div class="page-tree-bullet-and-indent" on:click={props.onClick}>
  {#if props.bulletState === PageTreeBulletState.EXPANDED}
    <div class="page-tree-bullet-and-indent_indent-area">
      <div class="page-tree-bullet-and-indent_indent-line" />
    </div>
  {/if}
  <div
    class="page-tree-bullet-and-indent_bullet-area"
    class:no-children={props.bulletState === PageTreeBulletState.NO_CHILDREN}
    class:expanded={props.bulletState === PageTreeBulletState.EXPANDED}
    class:collapsed={props.bulletState === PageTreeBulletState.COLLAPSED}
  />
</div>

<style>
  :root {
    /* インデントラインの太さ */
    --page-tree-indent-line-width: 1px;
    /* インデントラインの色 */
    --page-tree-indent-line-color: hsl(0, 0%, 80%);
    /* インデントラインの色（ホバー時） */
    --page-tree-indent-line-hover-color: hsl(0, 0%, 60%);

    /* バレット領域のサイズ（正方形の一辺の長さ） */
    --page-tree-bullet-area-size: 0.7em;

    /* 子を持たないノードのバレット（円形）の直径 */
    --page-tree-bullet-dot-diameter: 0.25em;

    /* 子を持つノードのバレット（二等辺三角形▼）の幅 */
    --page-tree-bullet-triangle-width: 0.5em;
    /* 子を持つノードのバレット（二等辺三角形▼）の高さ */
    --page-tree-bullet-triangle-height: 0.3em;

    /* バレットの色 */
    --page-tree-bullet-color: hsl(0, 0%, 50%);
    /* バレットの色（ホバー時） */
    --page-tree-bullet-hover-color: hsl(0, 0%, 30%);
  }

  .page-tree-bullet-and-indent {
    /* インデント領域の位置指定のため */
    position: relative;

    /*
    バレットが収まるギリギリまで幅を狭くする（メインエリアとの違いに注意）。
    ページツリーは横幅がシビアなのでインデント領域の幅を切り詰めないと厳しい。
    */
    width: var(--page-tree-bullet-area-size);
    height: 100%;
  }

  /* インデント領域 */
  .page-tree-bullet-and-indent_indent-area {
    position: absolute;
    /* バレットの中心のY座標から子リストの下端までの領域にする */
    top: calc(var(--page-tree-calculated-line-height) / 2);
    height: calc(100% - var(--page-tree-calculated-line-height) / 2);
    width: 100%;
  }

  /* インデントライン */
  .page-tree-bullet-and-indent_indent-line {
    background: var(--page-tree-indent-line-color);
    width: var(--page-tree-indent-line-width);
    height: 100%;
    margin: 0 auto;
  }
  /* ホバー時のインデントライン */
  .page-tree-bullet-and-indent:hover .page-tree-bullet-and-indent_indent-line {
    background: var(--page-tree-indent-line-hover-color);
  }

  /* バレットの共通設定 */
  .page-tree-bullet-and-indent_bullet-area {
    position: absolute;
    top: calc(var(--page-tree-calculated-line-height) / 2);
    left: 50%;
    transform: translate(-50%, -50%);

    width: var(--page-tree-bullet-area-size);
    height: var(--page-tree-bullet-area-size);
  }

  /* 展開済み状態のバレット */
  .page-tree-bullet-and-indent_bullet-area.expanded {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: var(--page-tree-bullet-triangle-height)
      calc(var(--page-tree-bullet-triangle-width) / 2) 0
      calc(var(--page-tree-bullet-triangle-width) / 2);
    border-color: var(--page-tree-bullet-color) transparent transparent transparent;
  }
  .page-tree-bullet-and-indent:hover .page-tree-bullet-and-indent_bullet-area.expanded {
    border-color: var(--page-tree-bullet-hover-color) transparent transparent transparent;
  }

  /* 折りたたみ済み状態のバレット */
  .page-tree-bullet-and-indent_bullet-area.collapsed {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: calc(var(--page-tree-bullet-triangle-width) / 2) 0
      calc(var(--page-tree-bullet-triangle-width) / 2) var(--page-tree-bullet-triangle-height);
    border-color: transparent transparent transparent var(--page-tree-bullet-color);
  }
  .page-tree-bullet-and-indent:hover .page-tree-bullet-and-indent_bullet-area.collapsed {
    border-color: transparent transparent transparent var(--page-tree-bullet-hover-color);
  }

  /* 子を持たないノードのバレット */
  .page-tree-bullet-and-indent_bullet-area.no-children {
    width: var(--page-tree-bullet-dot-diameter);
    height: var(--page-tree-bullet-dot-diameter);
    border-radius: 50%;
    background: var(--page-tree-bullet-color);
  }
  .page-tree-bullet-and-indent:hover .page-tree-bullet-and-indent_bullet-area.no-children {
    background: var(--page-tree-bullet-hover-color);
  }
</style>
