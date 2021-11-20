<script lang="ts">
  import {
    MainAreaBulletState,
    MainAreaRollProps,
  } from 'src/TreeifyTab/View/MainArea/MainAreaRollProps'

  export let props: MainAreaRollProps

  $: outerCircleStyle = `
    width: ${props.outerCircleRadiusEm}em;
    height: ${props.outerCircleRadiusEm}em;
  `
</script>

<div class="main-area-roll" on:click={props.onClick} on:contextmenu={props.onContextMenu}>
  {#if props.bulletState === MainAreaBulletState.EXPANDED}
    <div class="main-area-roll_indent-area">
      <div class="main-area-roll_indent-guide" />
    </div>
  {/if}
  <div class="main-area-roll_bullet-area">
    {#if props.bulletState === MainAreaBulletState.PAGE}
      <div class="main-area-roll_page-icon" />
    {:else}
      {#if props.bulletState === MainAreaBulletState.COLLAPSED}
        <div class="main-area-roll_outer-circle" style={outerCircleStyle} />
      {/if}
      <div class="main-area-roll_inner-circle" />
    {/if}
  </div>
</div>

<style global lang="scss">
  :root {
    --outer-circle-min-diameter: 1.1;
    --outer-circle-max-diameter: 1.35;
    // 外側の円が最大サイズになる子孫項目数
    --outer-circle-item-count-limit: 20;

    // バレットの外側の円の色。lch(90.0%, 0.0, 0.0)相当
    --main-area-bullet-outer-circle-color: #e2e2e2;
    // バレットの外側の円のマウスホバー時の色。lch(80.0%, 0.0, 0.0)相当
    --main-area-bullet-outer-circle-hover-color: #c6c6c6;
    // バレットの内側の円の色。lch(60.0%, 0.0, 0.0)相当
    --main-area-bullet-inner-circle-color: #919191;
    // バレットの内側の円のマウスホバー時の色。lch(40.0%, 0.0, 0.0)相当
    --main-area-bullet-inner-circle-hover-color: #5e5e5e;
    // バレットとして表示されるページアイコンの色。lch(30.0%, 0.0, 0.0)相当
    --main-area-bullet-page-icon-color: #474747;
    // バレットとして表示されるページアイコンのマウスホバー時の色。lch(20.0%, 0.0, 0.0)相当
    --main-area-bullet-page-icon-hover-color: #303030;

    // トランスクルードされた項目のバレットの色。lch(60.0%, 40.0, 160.4)相当
    --transcluded-item-bullet-color: #44a178;
    // トランスクルードされた項目のバレットのマウスホバー時の色。lch(40.0%, 40.0, 160.4)相当
    --transcluded-item-bullet-hover-color: #006c48;

    // ハイライト状態の項目のバレットの色。lch(50.0%, 134.0, 40.4)相当
    --highlighted-item-bullet-color: #ee0b00;
    // ハイライト状態の項目のバレットのマウスホバー時の色。lch(40.0%, 134.0, 40.4)相当
    --highlighted-item-bullet-hover-color: #bf0600;

    // インデントガイドの色。lch(88.0%, 0.0, 0.0)相当
    --main-area-indent-guide-color: #dddddd;
    // インデントガイドの色（ホバー時）。lch(70.0%, 0.0, 0.0)相当
    --main-area-indent-guide-hover-color: #ababab;
  }

  // トランスクルードされた項目の強調表示
  .transcluded {
    .main-area-roll_inner-circle {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-roll:hover .main-area-roll_inner-circle {
      background: var(--transcluded-item-bullet-hover-color);
    }

    .main-area-roll_page-icon {
      background: var(--transcluded-item-bullet-color);
    }

    .main-area-roll:hover .main-area-roll_page-icon {
      background: var(--transcluded-item-bullet-hover-color);
    }
  }

  // ハイライト状態の項目の強調表示
  .highlighted {
    .main-area-roll_inner-circle {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-roll:hover .main-area-roll_inner-circle {
      background: var(--highlighted-item-bullet-hover-color);
    }

    .main-area-roll_page-icon {
      background: var(--highlighted-item-bullet-color);
    }

    .main-area-roll:hover .main-area-roll_page-icon {
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

    .main-area-roll:hover .main-area-roll_inner-circle {
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

    .main-area-roll:hover .main-area-roll_page-icon {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-hover-color) 50%,
        var(--transcluded-item-bullet-hover-color) 50%
      );
    }
  }

  // メインエリアのバレットとインデントのルート要素
  .main-area-roll {
    width: var(--main-area-calculated-line-height);
    height: 100%;
    // インデントガイドをバレットの裏まで描画するための設定
    position: relative;

    cursor: pointer;
  }

  .main-area-roll_bullet-area {
    width: var(--main-area-calculated-line-height);
    aspect-ratio: 1;
    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  // メインエリアのバレットの外側の円（展開状態用）
  .main-area-roll_outer-circle {
    // widthとheightがJavaScriptで設定される

    border-radius: 50%;
    background: var(--main-area-bullet-outer-circle-color);

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .main-area-roll:hover & {
      background: var(--main-area-bullet-outer-circle-hover-color);
    }
  }

  // メインエリアのバレットの内側の円
  .main-area-roll_inner-circle {
    width: 0.38em;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--main-area-bullet-inner-circle-color);

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .main-area-roll:hover & {
      background: var(--main-area-bullet-inner-circle-hover-color);
    }
  }

  // ページのバレット
  .main-area-roll_page-icon {
    width: 1em;
    aspect-ratio: 1;

    background: var(--main-area-bullet-page-icon-color);
    -webkit-mask: url('page-icon.svg') no-repeat center;
    -webkit-mask-size: contain;

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .main-area-roll:hover & {
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
    .main-area-roll:hover & {
      background: var(--main-area-indent-guide-hover-color);
    }
  }
</style>
