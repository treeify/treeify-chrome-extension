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

  :root {
    --main-area-bullet-outer-circle-min-diameter: 1.05;
    --main-area-bullet-outer-circle-max-diameter: 1.3;
    // 外側の円が最大サイズになる子孫項目数
    --main-area-bullet-outer-circle-item-count-limit: 20;

    // バレットの外側の円の色
    --main-area-bullet-outer-circle-color: lch(90% 0 0);
    // バレットの外側の円のマウスホバー時の色
    --main-area-bullet-outer-circle-hover-color: lch(80% 0 0);
    // バレットとして表示されるページアイコンの色
    --main-area-bullet-page-icon-color: lch(30% 0 0);
    // バレットとして表示されるページアイコンのマウスホバー時の色
    --main-area-bullet-page-icon-hover-color: lch(20% 0 0);

    // インデントガイドの色
    --main-area-indent-guide-color: lch(88% 0 0);
    // インデントガイドの色（ホバー時）
    --main-area-indent-guide-hover-color: lch(70% 0 0);
  }

  // トランスクルードされた項目の強調表示
  .transcluded {
    .main-area-bullet-and-indent_bullet {
      background: var(--transcluded-item-bullet-default-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: var(--transcluded-item-bullet-hover-default-color);
    }

    .main-area-bullet-and-indent_page-icon {
      background: var(--transcluded-item-bullet-default-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: var(--transcluded-item-bullet-hover-default-color);
    }
  }

  // ハイライト状態の項目の強調表示
  .highlighted {
    .main-area-bullet-and-indent_bullet {
      background: var(--highlighted-item-bullet-default-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: var(--highlighted-item-bullet-hover-default-color);
    }

    .main-area-bullet-and-indent_page-icon {
      background: var(--highlighted-item-bullet-default-color);
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: var(--highlighted-item-bullet-hover-default-color);
    }
  }

  .transcluded.highlighted {
    .main-area-bullet-and-indent_bullet {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-default-color) 50%,
        var(--transcluded-item-bullet-default-color) 50%
      );
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_bullet {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-default-color) 50%,
        var(--transcluded-item-bullet-hover-default-color) 50%
      );
    }

    .main-area-bullet-and-indent_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-default-color) 50%,
        var(--transcluded-item-bullet-default-color) 50%
      );
    }

    .main-area-bullet-and-indent_root:hover .main-area-bullet-and-indent_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-default-color) 50%,
        var(--transcluded-item-bullet-hover-default-color) 50%
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
    @include common.square(var(--main-area-calculated-line-height));

    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  // メインエリアのバレットの外側の円（展開状態用）
  .main-area-bullet-and-indent_outer-circle {
    @include common.circle(var(--outer-circle-radius));
    @include common.absolute-center;

    background: var(--main-area-bullet-outer-circle-color);

    .main-area-bullet-and-indent_root:hover & {
      background: var(--main-area-bullet-outer-circle-hover-color);
    }
  }

  // メインエリアのバレットの内側の円
  .main-area-bullet-and-indent_bullet {
    @include common.circle(0.38em);
    @include common.absolute-center;

    background: var(--bullet-default-color);

    .main-area-bullet-and-indent_root:hover & {
      background: var(--bullet-hover-default-color);
    }
  }

  // ページのバレット
  .main-area-bullet-and-indent_page-icon {
    @include common.square(1em);
    @include common.absolute-center;
    @include common.icon(var(--main-area-bullet-page-icon-color), url('page.svg'));

    .main-area-bullet-and-indent_root:hover & {
      background: var(--main-area-bullet-page-icon-hover-color);
    }
  }

  // インデント領域
  .main-area-bullet-and-indent_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    top: calc(var(--main-area-calculated-line-height) / 2);
    height: calc(100% - var(--main-area-calculated-line-height) / 2);
    width: 100%;
  }

  // インデントガイド
  .main-area-bullet-and-indent_indent-guide {
    background: var(--main-area-indent-guide-color);
    width: 1px;
    height: 100%;
    margin: 0 auto;

    // バレットとインデントの領域のホバー時のインデントガイド
    .main-area-bullet-and-indent_root:hover & {
      background: var(--main-area-indent-guide-hover-color);
    }
  }
</style>
