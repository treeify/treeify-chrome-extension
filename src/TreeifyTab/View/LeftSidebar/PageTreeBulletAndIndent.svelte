<script lang="ts">
  import {
    PageTreeBulletAndIndentProps,
    PageTreeBulletState,
  } from 'src/TreeifyTab/View/LeftSidebar/PageTreeBulletAndIndentProps'

  export let props: PageTreeBulletAndIndentProps
</script>

<div class="page-tree-bullet-and-indent" on:mousedown={props.onClick}>
  {#if props.bulletState === PageTreeBulletState.UNFOLDED}
    <div class="page-tree-bullet-and-indent_indent-area">
      <div class="page-tree-bullet-and-indent_indent-guide" />
    </div>
  {/if}
  <div
    class="page-tree-bullet-and-indent_bullet-area"
    class:no-children={props.bulletState === PageTreeBulletState.NO_CHILDREN}
    class:unfolded={props.bulletState === PageTreeBulletState.UNFOLDED}
    class:folded={props.bulletState === PageTreeBulletState.FOLDED}
  />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // インデントガイドの色。lch(88.0%, 0.0, 0.0)相当
    --page-tree-indent-guide-color: #dddddd;
    // インデントガイドの色（ホバー時）。lch(70.0%, 0.0, 0.0)相当
    --page-tree-indent-guide-hover-color: #ababab;

    // バレット領域のサイズ（正方形の一辺の長さ）
    --page-tree-bullet-area-size: 0.8em;

    // 折りたたまれたノードのバレット（二等辺三角形▶）の幅
    --page-tree-bullet-folded-width: 0.56em;
    // 折りたたまれたノードのバレット（二等辺三角形▶）の高さ
    --page-tree-bullet-folded-height: 0.38em;

    // 折りたたまれたノードのバレット（二等辺三角形▼）の幅
    --page-tree-bullet-unfolded-width: 0.45em;
    // 折りたたまれたノードのバレット（二等辺三角形▼）の高さ
    --page-tree-bullet-unfolded-height: 0.3em;

    // バレットの色。lch(60.0%, 0.0, 0.0)相当
    --page-tree-bullet-color: #919191;
    // バレットの色（ホバー時）。lch(40.0%, 0.0, 0.0)相当
    --page-tree-bullet-hover-color: #5e5e5e;
  }

  .page-tree-bullet-and-indent {
    // インデント領域の位置指定のため
    position: relative;

    // バレットが収まるギリギリまで幅を狭くする（メインエリアとの違いに注意）。
    // ページツリーは横幅がシビアなのでインデント領域の幅を切り詰めないと厳しい。
    width: var(--page-tree-bullet-area-size);
    height: 100%;
  }

  // インデント領域
  .page-tree-bullet-and-indent_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    top: calc(var(--page-tree-calculated-line-height) / 2);
    height: calc(100% - var(--page-tree-calculated-line-height) / 2);
    width: 100%;
  }

  // インデントガイド
  .page-tree-bullet-and-indent_indent-guide {
    background: var(--page-tree-indent-guide-color);
    width: 1px;
    height: 100%;
    margin: 0 auto;

    // ホバー時のインデントガイド
    .page-tree-bullet-and-indent:hover & {
      background: var(--page-tree-indent-guide-hover-color);
    }
  }

  // バレットの共通設定
  .page-tree-bullet-and-indent_bullet-area {
    @include common.square(var(--page-tree-bullet-area-size));

    position: absolute;
    top: calc(var(--page-tree-calculated-line-height) / 2);
    left: 50%;
    transform: translate(-50%, -50%);

    // 展開済み状態のバレット
    &.unfolded {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: var(--page-tree-bullet-unfolded-height)
        calc(var(--page-tree-bullet-unfolded-width) / 2) 0
        calc(var(--page-tree-bullet-unfolded-width) / 2);
      border-color: var(--page-tree-bullet-color) transparent transparent transparent;

      .page-tree-bullet-and-indent:hover & {
        border-color: var(--page-tree-bullet-hover-color) transparent transparent transparent;
      }
    }

    // 折りたたみ済み状態のバレット
    &.folded {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: calc(var(--page-tree-bullet-folded-width) / 2) 0
        calc(var(--page-tree-bullet-folded-width) / 2) var(--page-tree-bullet-folded-height);
      border-color: transparent transparent transparent var(--page-tree-bullet-color);

      .page-tree-bullet-and-indent:hover & {
        border-color: transparent transparent transparent var(--page-tree-bullet-hover-color);
      }
    }

    // 子を持たないノードのバレット
    &.no-children {
      @include common.circle(0.25em);

      background: var(--page-tree-bullet-color);

      .page-tree-bullet-and-indent:hover & {
        background: var(--page-tree-bullet-hover-color);
      }
    }
  }
</style>
