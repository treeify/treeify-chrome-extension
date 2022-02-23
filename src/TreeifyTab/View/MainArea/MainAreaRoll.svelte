<script lang="ts">
  import {
    MainAreaBulletState,
    MainAreaRollProps,
  } from 'src/TreeifyTab/View/MainArea/MainAreaRollProps'

  export let props: MainAreaRollProps
</script>

<div
  class="main-area-roll_root"
  style:--outer-circle-radius="{props.outerCircleRadiusEm}em"
  on:click={props.onClick}
  on:contextmenu={props.onContextMenu}
>
  {#if props.bulletState === MainAreaBulletState.UNFOLDED}
    <div class="main-area-roll_indent-area">
      <div class="main-area-roll_indent-guide" />
    </div>
  {/if}
  <div class="main-area-roll_bullet-area">
    {#if props.bulletState === MainAreaBulletState.PAGE}
      <div class="main-area-roll_page-icon" />
    {:else}
      {#if props.bulletState === MainAreaBulletState.FOLDED}
        <div class="main-area-roll_outer-circle" />
      {/if}
      <div class="main-area-roll_inner-circle" />
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
    // バレットの内側の円のマウスホバー時の色
    --main-area-bullet-inner-circle-hover-color: lch(40% 0 0);
    // バレットとして表示されるページアイコンの色
    --main-area-bullet-page-icon-color: lch(30% 0 0);
    // バレットとして表示されるページアイコンのマウスホバー時の色
    --main-area-bullet-page-icon-hover-color: lch(20% 0 0);

    // トランスクルードされた項目のバレットの色
    --transcluded-item-bullet-color: lch(60% 40 160.4);
    // トランスクルードされた項目のバレットのマウスホバー時の色
    --transcluded-item-bullet-hover-color: lch(40% 40 160.4);

    // ハイライト状態の項目のバレットの色。彩度は色域境界値
    --highlighted-item-bullet-color: lch(50% 98.7 40.4);
    // ハイライト状態の項目のバレットのマウスホバー時の色。彩度は色域境界値
    --highlighted-item-bullet-hover-color: lch(40% 83.7 40.4);

    // インデントガイドの色
    --main-area-indent-guide-color: lch(88% 0 0);
    // インデントガイドの色（ホバー時）
    --main-area-indent-guide-hover-color: lch(70% 0 0);
  }

  // トランスクルードされた項目の強調表示
  .transcluded {
    .main-area-roll_inner-circle {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-roll_root:hover .main-area-roll_inner-circle {
      background: var(--transcluded-item-bullet-hover-color);
    }

    .main-area-roll_page-icon {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-roll_root:hover .main-area-roll_page-icon {
      background: var(--transcluded-item-bullet-hover-color);
    }
  }

  // ハイライト状態の項目の強調表示
  .highlighted {
    .main-area-roll_inner-circle {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-roll_root:hover .main-area-roll_inner-circle {
      background: var(--highlighted-item-bullet-hover-color);
    }

    .main-area-roll_page-icon {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-roll_root:hover .main-area-roll_page-icon {
      background: var(--highlighted-item-bullet-hover-color);
    }
  }

  .transcluded.highlighted {
    .main-area-roll_inner-circle {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-color) 50%,
        var(--transcluded-item-bullet-color) 50%
      );
    }

    .main-area-roll_root:hover .main-area-roll_inner-circle {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-color) 50%,
        var(--transcluded-item-bullet-hover-color) 50%
      );
    }

    .main-area-roll_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-color) 50%,
        var(--transcluded-item-bullet-color) 50%
      );
    }

    .main-area-roll_root:hover .main-area-roll_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-color) 50%,
        var(--transcluded-item-bullet-hover-color) 50%
      );
    }
  }

  // メインエリアのバレットとインデントのルート要素
  .main-area-roll_root {
    width: var(--main-area-calculated-line-height);
    height: 100%;
    // インデントガイドをバレットの裏まで描画するための設定
    position: relative;

    cursor: pointer;
  }

  .main-area-roll_bullet-area {
    @include common.square(var(--main-area-calculated-line-height));

    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  // メインエリアのバレットの外側の円（展開状態用）
  .main-area-roll_outer-circle {
    @include common.circle(var(--outer-circle-radius));
    @include common.absolute-center;

    background: var(--main-area-bullet-outer-circle-color);

    .main-area-roll_root:hover & {
      background: var(--main-area-bullet-outer-circle-hover-color);
    }
  }

  // メインエリアのバレットの内側の円
  .main-area-roll_inner-circle {
    @include common.circle(0.38em);
    @include common.absolute-center;

    background: var(--bullet-default-color);

    .main-area-roll_root:hover & {
      background: var(--main-area-bullet-inner-circle-hover-color);
    }
  }

  // ページのバレット
  .main-area-roll_page-icon {
    @include common.square(1em);
    @include common.absolute-center;
    @include common.icon(var(--main-area-bullet-page-icon-color), url('page.svg'));

    .main-area-roll_root:hover & {
      background: var(--main-area-bullet-page-icon-hover-color);
    }
  }

  // インデント領域
  .main-area-roll_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    top: calc(var(--main-area-calculated-line-height) / 2);
    height: calc(100% - var(--main-area-calculated-line-height) / 2);
    width: 100%;
  }

  // インデントガイド
  .main-area-roll_indent-guide {
    background: var(--main-area-indent-guide-color);
    width: 1px;
    height: 100%;
    margin: 0 auto;

    // バレットとインデントの領域のホバー時のインデントガイド
    .main-area-roll_root:hover & {
      background: var(--main-area-indent-guide-hover-color);
    }
  }
</style>
