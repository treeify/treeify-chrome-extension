<script lang="ts">
  import {MainAreaBulletState, MainAreaSpoolProps} from './MainAreaSpoolProps'

  export let props: MainAreaSpoolProps

  // TODO: ↓ハードコーディングが激しい。できればユーザーがバレットのサイズを設定できるようにしたい
  $: limitedHiddenItemsCount = Math.min(props.hiddenItemsCount, 10)
  $: outerCircleRadiusEm = 1.1 + limitedHiddenItemsCount * 0.025
  $: outerCircleStyle = `
    width: ${outerCircleRadiusEm}em;
    height: ${outerCircleRadiusEm}em;
  `
</script>

<div class="main-area-spool" on:click={props.onClick}>
  {#if props.bulletState === MainAreaBulletState.EXPANDED}
    <div class="main-area-spool_indent-area">
      <div class="main-area-spool_indent-line" />
    </div>
  {/if}
  <div class="main-area-spool_bullet-area">
    {#if props.bulletState === MainAreaBulletState.PAGE}
      <div class="main-area-spool_page-icon" />
    {:else}
      {#if props.bulletState === MainAreaBulletState.COLLAPSED}
        <div class="main-area-spool_outer-circle" style={outerCircleStyle} />
      {/if}
      <div class="main-area-spool_inner-circle" />
    {/if}
  </div>
</div>

<style>
  :root {
    /* バレットの外側の円の色。lch(90.0%, 0.0, 0.0)相当 */
    --main-area-bullet-outer-circle-color: #e2e2e2;
    /* バレットの外側の円のマウスホバー時の色。lch(80.0%, 0.0, 0.0)相当 */
    --main-area-bullet-outer-circle-hover-color: #c6c6c6;
    /* バレットの内側の円の直径 */
    --main-area-bullet-inner-circle-diameter: 0.38em;
    /* バレットの内側の円の色。lch(60.0%, 0.0, 0.0)相当 */
    --main-area-bullet-inner-circle-color: #919191;
    /* バレットの内側の円のマウスホバー時の色。lch(40.0%, 0.0, 0.0)相当 */
    --main-area-bullet-inner-circle-hover-color: #5e5e5e;
    /* バレットとして表示されるページアイコンの色。lch(40.0%, 0.0, 0.0)相当 */
    --main-area-bullet-page-icon-color: #5e5e5e;
    /* バレットとして表示されるページアイコンのマウスホバー時の色。lch(20.0%, 0.0, 0.0)相当 */
    --main-area-bullet-page-icon-hover-color: #303030;
    /* バレットとして表示されるページアイコンのサイズ（正方形の一辺の長さ） */
    --bullet-page-icon-size: 1em;

    /* トランスクルードされたアイテムのバレットの色。lch(60.0%, 40.0, 160.4)相当 */
    --transcluded-item-bullet-color: #44a178;
    /* トランスクルードされたアイテムのバレットのマウスホバー時の色。lch(40.0%, 40.0, 160.4)相当 */
    --transcluded-item-bullet-hover-color: #006c48;

    /* ハイライト状態のアイテムのバレットの色。lch(50.0%, 134.0, 40.4)相当 */
    --highlighted-item-bullet-color: #ee0b00;
    /* ハイライト状態のアイテムのバレットのマウスホバー時の色。lch(40.0%, 134.0, 40.4)相当 */
    --highlighted-item-bullet-hover-color: #bf0600;

    /* インデントラインの太さ */
    --main-area-indent-line-width: 1px;
    /* インデントラインの色。lch(88.0%, 0.0, 0.0)相当 */
    --main-area-indent-line-color: #dddddd;
    /* インデントラインの色（ホバー時）。lch(70.0%, 0.0, 0.0)相当 */
    --main-area-indent-line-hover-color: #ababab;
  }

  /* トランスクルードされたアイテムの強調表示 */
  :global(.transcluded) .main-area-spool_inner-circle {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .main-area-spool:hover .main-area-spool_inner-circle {
    background: var(--transcluded-item-bullet-hover-color);
  }
  :global(.transcluded) .main-area-spool_page-icon {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .main-area-spool:hover .main-area-spool_page-icon {
    background: var(--transcluded-item-bullet-hover-color);
  }

  /* ハイライト状態のアイテムの強調表示 */
  :global(.highlighted) .main-area-spool_inner-circle {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .main-area-spool:hover .main-area-spool_inner-circle {
    background: var(--highlighted-item-bullet-hover-color);
  }
  :global(.highlighted) .main-area-spool_page-icon {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .main-area-spool:hover .main-area-spool_page-icon {
    background: var(--highlighted-item-bullet-hover-color);
  }

  /* メインエリアのバレットとインデントのルート要素 */
  .main-area-spool {
    width: var(--main-area-calculated-line-height);
    height: 100%;
    /* インデントラインをバレットの裏まで描画するための設定 */
    position: relative;

    cursor: pointer;
  }

  .main-area-spool_bullet-area {
    width: var(--main-area-calculated-line-height);
    height: var(--main-area-calculated-line-height);
    /* 外側の円と内側の円を重ねて描画するための設定 */
    position: relative;
  }

  /* メインエリアのバレットの外側の円（展開状態用） */
  .main-area-spool_outer-circle {
    /* widthとheightがJavaScriptで設定される */

    border-radius: 50%;
    background: var(--main-area-bullet-outer-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .main-area-spool:hover .main-area-spool_outer-circle {
    background: var(--main-area-bullet-outer-circle-hover-color);
  }

  /* メインエリアのバレットの内側の円 */
  .main-area-spool_inner-circle {
    width: var(--main-area-bullet-inner-circle-diameter);
    height: var(--main-area-bullet-inner-circle-diameter);
    border-radius: 50%;
    background: var(--main-area-bullet-inner-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .main-area-spool:hover .main-area-spool_inner-circle {
    background: var(--main-area-bullet-inner-circle-hover-color);
  }

  /* ページのバレット */
  .main-area-spool_page-icon {
    width: var(--bullet-page-icon-size);
    height: var(--bullet-page-icon-size);

    background: var(--main-area-bullet-page-icon-color);
    -webkit-mask-image: url('./page-icon.svg');

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .main-area-spool:hover .main-area-spool_page-icon {
    background: var(--main-area-bullet-page-icon-hover-color);
  }

  /* インデント領域 */
  .main-area-spool_indent-area {
    position: absolute;
    /* バレットの中心のY座標から子リストの下端までの領域にする */
    top: calc(var(--main-area-calculated-line-height) / 2);
    height: calc(100% - var(--main-area-calculated-line-height) / 2);
    width: 100%;
  }

  /* インデントライン */
  .main-area-spool_indent-line {
    background: var(--main-area-indent-line-color);
    width: var(--main-area-indent-line-width);
    height: 100%;
    margin: 0 auto;
  }

  /* バレットとインデントの領域のホバー時のインデントライン */
  .main-area-spool:hover .main-area-spool_indent-line {
    background: var(--main-area-indent-line-hover-color);
  }
</style>
