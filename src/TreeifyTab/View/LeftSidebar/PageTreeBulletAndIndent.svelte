<script lang="ts">
  import {
    PageTreeBulletAndIndentProps,
    PageTreeBulletState,
  } from 'src/TreeifyTab/View/LeftSidebar/PageTreeBulletAndIndentProps'

  export let props: PageTreeBulletAndIndentProps
</script>

<div
  class="page-tree-bullet-and-indent_root {props.cssClasses.join(' ')}"
  style:--outer-circle-size="{props.outerCircleSizeEm}em"
  on:mousedown={props.onClick}
>
  {#if props.bulletState === PageTreeBulletState.UNFOLDED}
    <div class="page-tree-bullet-and-indent_indent-area">
      <div class="page-tree-bullet-and-indent_indent-guide" />
    </div>
  {/if}
  <div class="page-tree-bullet-and-indent_bullet-area">
    {#if props.bulletState === PageTreeBulletState.FOLDED}
      <div class="page-tree-bullet-and-indent_bullet-outer-circle" />
    {/if}
    <div class="page-tree-bullet-and-indent_bullet" />
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --page-tree-bullet-area-width: #{common.toIntegerPx(1em)};

    --page-tree-bullet-outer-circle-min-size-em: 0.75;
    --page-tree-bullet-outer-circle-max-size-em: 1;
    // 外側の円が最大サイズになる子孫項目数
    --page-tree-bullet-outer-circle-item-count-limit: 5;
  }

  .page-tree-bullet-and-indent_root {
    position: relative;

    // ページツリーは横幅に余裕がないのでインデント領域の幅を切り詰める
    width: var(--page-tree-bullet-area-width);
    height: 100%;

    cursor: pointer;
  }

  .page-tree-bullet-and-indent_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    padding-top: calc(var(--page-tree-calculated-line-height) / 2);
    @include common.size(100%);
  }

  .page-tree-bullet-and-indent_indent-guide {
    background: var(--indent-guide-color);

    width: 1px;
    height: 100%;
    margin: 0 auto;

    .page-tree-bullet-and-indent_root:hover & {
      background: var(--indent-guide-hover-color);
    }
  }

  .page-tree-bullet-and-indent_bullet-area {
    height: var(--page-tree-calculated-line-height);

    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  .page-tree-bullet-and-indent_bullet-outer-circle {
    @include common.circle(var(--outer-circle-size));
    @include common.absolute-center;

    background: var(--bullet-outer-circle-color);

    .page-tree-bullet-and-indent_root:hover & {
      background: var(--bullet-outer-circle-hover-color);
    }
  }

  .page-tree-bullet-and-indent_bullet {
    @include common.circle(common.toIntegerPx(0.3em));
    @include common.absolute-center;

    background: var(--bullet-color);

    .page-tree-bullet-and-indent_root:hover & {
      background: var(--bullet-hover-color);
    }

    .highlighted & {
      background-color: var(--highlighted-item-bullet-color);
    }

    .highlighted.page-tree-bullet-and-indent_root:hover & {
      background: var(--highlighted-item-bullet-hover-color);
    }
  }
</style>
