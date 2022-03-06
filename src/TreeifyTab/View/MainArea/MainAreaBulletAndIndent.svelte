<script lang="ts">
  import {
    MainAreaBulletAndIndentProps,
    MainAreaBulletState,
  } from 'src/TreeifyTab/View/MainArea/MainAreaBulletAndIndentProps'

  export let props: MainAreaBulletAndIndentProps
</script>

<div
  class="main-area-bullet-and-indent_root"
  style:--outer-circle-radius="{props.outerCircleRadiusEm}em"
  on:click={props.onClick}
  on:contextmenu={props.onContextMenu}
>
  {#if props.bulletState === MainAreaBulletState.UNFOLDED}
    <div class="main-area-bullet-and-indent_indent-area">
      <div class="main-area-bullet-and-indent_indent-guide" />
    </div>
  {/if}
  <div class="main-area-bullet-and-indent_bullet-area">
    {#if props.bulletState === MainAreaBulletState.PAGE}
      <div class="main-area-bullet-and-indent_page-icon" />
    {:else}
      {#if props.bulletState === MainAreaBulletState.FOLDED}
        <div class="main-area-bullet-and-indent_outer-circle" />
      {/if}
      <div class="main-area-bullet-and-indent_bullet" />
    {/if}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  // トランスクルードされた項目の強調表示
  .transcluded {
    .main-area-bullet-and-indent_bullet {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: var(--transcluded-item-bullet-hover-color);
    }

    .main-area-bullet-and-indent_page-icon {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: var(--transcluded-item-bullet-hover-color);
    }
  }

  // ハイライト状態の項目の強調表示
  .highlighted {
    .main-area-bullet-and-indent_bullet {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: var(--highlighted-item-bullet-hover-color);
    }

    .main-area-bullet-and-indent_page-icon {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: var(--highlighted-item-bullet-hover-color);
    }
  }

  .transcluded.highlighted {
    .main-area-bullet-and-indent_bullet {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-color) 50%,
        var(--transcluded-item-bullet-color) 50%
      );
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-color) 50%,
        var(--transcluded-item-bullet-hover-color) 50%
      );
    }

    .main-area-bullet-and-indent_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-color) 50%,
        var(--transcluded-item-bullet-color) 50%
      );
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-color) 50%,
        var(--transcluded-item-bullet-hover-color) 50%
      );
    }
  }

  // メインエリアのバレットとインデントのルート要素
  .main-area-bullet-and-indent_root {
    width: var(--main-area-calculated-line-height);
    height: 100%;
    // インデントガイドをバレットの裏まで描画するための設定
    position: relative;

    cursor: pointer;
  }

  .main-area-bullet-and-indent_bullet-area {
    @include common.size(var(--main-area-calculated-line-height));

    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  // メインエリアのバレットの外側の円（展開状態用）
  .main-area-bullet-and-indent_outer-circle {
    @include common.circle(var(--outer-circle-radius));
    @include common.absolute-center;

    background: var(--bullet-outer-circle-color);

    .main-area-bullet-and-indent_root:hover & {
      background: var(--bullet-outer-circle-hover-color);
    }
  }

  // メインエリアのバレットの内側の円
  .main-area-bullet-and-indent_bullet {
    @include common.circle(var(--bullet-size));
    @include common.absolute-center;

    background: var(--bullet-color);

    .main-area-bullet-and-indent_root:hover & {
      background: var(--bullet-hover-color);
    }
  }

  // ページのバレット
  .main-area-bullet-and-indent_page-icon {
    @include common.size(common.em(1));
    @include common.absolute-center;
    @include common.icon(var(--page-icon-color), url('page.svg'));

    .main-area-bullet-and-indent_root:hover & {
      background: var(--page-icon-hover-color);
    }
  }

  // インデント領域
  .main-area-bullet-and-indent_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    top: calc(var(--main-area-calculated-line-height) / 2);
    height: calc(100% - var(--main-area-calculated-line-height) / 2);
    width: 100%;

    @include common.flex-center;
  }

  // インデントガイド
  .main-area-bullet-and-indent_indent-guide {
    background: var(--indent-guide-color);
    width: 1px;
    height: 100%;

    // バレットとインデントの領域のホバー時のインデントガイド
    .main-area-bullet-and-indent_root:hover & {
      background: var(--indent-guide-hover-color);
    }
  }
</style>
