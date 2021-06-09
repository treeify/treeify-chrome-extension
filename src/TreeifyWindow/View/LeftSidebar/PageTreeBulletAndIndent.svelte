<script context="module" lang="ts">
  export function createPageTreeBulletAndIndentProps(
    hasChildren: boolean
  ): {bulletState: PageTreeBulletState} {
    if (hasChildren) {
      return {bulletState: PageTreeBulletState.EXPANDED}
    } else {
      return {bulletState: PageTreeBulletState.NO_CHILDREN}
    }
  }

  enum PageTreeBulletState {
    NO_CHILDREN,
    EXPANDED,
    COLLAPSED,
  }
</script>

<script lang="ts">
  export let bulletState: PageTreeBulletState
</script>

<div class="page-tree-bullet-and-indent">
  {#if bulletState === PageTreeBulletState.EXPANDED}
    <div class="page-tree-bullet-and-indent_indent-area">
      <div class="page-tree-bullet-and-indent_indent-line" />
    </div>
  {/if}
  <div
    class="page-tree-bullet-and-indent_bullet-area"
    class:no-children={bulletState === PageTreeBulletState.NO_CHILDREN}
    class:expanded={bulletState === PageTreeBulletState.EXPANDED}
    class:collapsed={bulletState === PageTreeBulletState.COLLAPSED}
  />
</div>

<style>
  :root {
    /* インデントラインの太さ */
    --page-tree-indent-line-width: 1px;
    /* インデントラインの色 */
    --page-tree-indent-line-color: hsl(0, 0%, 80%);
    /* インデントラインの色（ホバー時） */
    --page-tree-indent-line-hover-color: hsl(0, 0%, 70%);

    /* バレットのサイズ（正方形の一辺の長さ） */
    --page-tree-bullet-size: 0.7em;
  }

  .page-tree-bullet-and-indent {
    /* インデント領域の位置指定のため */
    position: relative;

    /*
        バレットが収まるギリギリまで幅を狭くする（アイテムツリーとの違いに注意）。
        ページツリーは横幅がシビアなのでインデント領域の幅を切り詰めないと厳しい。
        */
    width: var(--page-tree-bullet-size);
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

    width: var(--page-tree-bullet-size);
    height: var(--page-tree-bullet-size);
  }

  /* 展開済み状態のバレット */
  .page-tree-bullet-and-indent_bullet-area.expanded {
    /* TODO: 画像待ち */
    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    /*background-color: hsl(0, 0%, 60%);*/
    /*-webkit-mask-image: url('menu-down.svg');*/
  }
</style>
