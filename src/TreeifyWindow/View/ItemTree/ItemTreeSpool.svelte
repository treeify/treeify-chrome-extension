<script lang="ts">
  import {integer} from '../../../Common/integer'

  type ItemTreeSpoolViewModel = {
    bulletState: ItemTreeBulletState
    /**
     * expand時に表示されるアイテム数。
     * collapsed状態以外の場合は常に0。
     */
    hiddenItemsCount: integer
    onClick: (event: MouseEvent) => void
  }

  enum ItemTreeBulletState {
    NO_CHILDREN,
    EXPANDED,
    COLLAPSED,
    PAGE,
  }

  export let viewModel: ItemTreeSpoolViewModel

  // TODO: ↓ハードコーディングが激しい。できればユーザーがバレットのサイズを設定できるようにしたい
  $: limitedHiddenItemsCount = Math.min(viewModel.hiddenItemsCount, 10)
  $: outerCircleRadiusEm = 1.1 + limitedHiddenItemsCount * 0.025
  $: outerCircleStyle = `
    width: ${outerCircleRadiusEm}em;
    height: ${outerCircleRadiusEm}em;
  `
</script>

<div class="item-tree-spool" on:click={viewModel.onClick}>
  {#if viewModel.bulletState === ItemTreeBulletState.EXPANDED}
    <div class="item-tree-spool_indent-area">
      <div class="item-tree-spool_indent-line" />
    </div>
  {/if}
  <div class="item-tree-spool_bullet-area">
    {#if viewModel.bulletState === ItemTreeBulletState.PAGE}
      <div class="item-tree-spool_page-icon" />
    {:else}
      {#if viewModel.bulletState === ItemTreeBulletState.COLLAPSED}
        <div class="item-tree-spool_outer-circle" style={outerCircleStyle} />
      {/if}
      <div class="item-tree-spool_inner-circle" />
    {/if}
  </div>
</div>

<style>
  :root {
    /* バレットの外側の円の直径は{@link ItemTreeSpoolView.ts}で動的に設定している */
    /* バレットの外側の円の色 */
    --item-tree-bullet-outer-circle-color: hsl(0, 0%, 80%);
    /* バレットの外側の円のマウスホバー時の色 */
    --item-tree-bullet-outer-circle-hover-color: hsl(0, 0%, 70%);
    /* バレットの内側の円の直径 */
    --item-tree-bullet-inner-circle-diameter: 0.45em;
    /* バレットの内側の円の色 */
    --item-tree-bullet-inner-circle-color: hsl(0, 0%, 35%);
    /* バレットの内側の円のマウスホバー時の色 */
    --item-tree-bullet-inner-circle-hover-color: hsl(0, 0%, 0%);
    /* バレットとして表示されるページアイコンのサイズ（正方形の一辺の長さ） */
    --bullet-page-icon-size: 1em;

    /* トランスクルードされたアイテムのバレットの色 */
    --transcluded-item-bullet-color: hsl(120, 50%, 40%);
    /* トランスクルードされたアイテムのバレットのマウスホバー時の色 */
    --transcluded-item-bullet-hover-color: hsl(120, 50%, 35%);

    /* ハイライト状態のアイテムのバレットの色 */
    --highlighted-item-bullet-color: hsl(0, 100%, 45%);
    /* ハイライト状態のアイテムのバレットのマウスホバー時の色 */
    --highlighted-item-bullet-hover-color: hsl(0, 100%, 40%);

    /* インデントラインの太さ */
    --item-tree-indent-line-width: 1px;
    /* インデントラインの色 */
    --item-tree-indent-line-color: hsl(0, 0%, 88%);
    /* インデントラインの色（ホバー時） */
    --item-tree-indent-line-hover-color: hsl(0, 0%, 70%);
  }

  /* トランスクルードされたアイテムの強調表示 */
  :global(.transcluded) .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-hover-color);
  }
  :global(.transcluded) .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-hover-color);
  }

  /* ハイライト状態のアイテムの強調表示 */
  :global(.highlighted) .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-hover-color);
  }
  :global(.highlighted) .item-tree-spool_page-icon {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--highlighted-item-bullet-hover-color);
  }

  /* アイテムツリーのバレットとインデントのルート要素 */
  .item-tree-spool {
    width: var(--item-tree-calculated-line-height);
    height: 100%;
    /* インデントラインをバレットの裏まで描画するための設定 */
    position: relative;

    cursor: pointer;
  }

  .item-tree-spool_bullet-area {
    width: var(--item-tree-calculated-line-height);
    height: var(--item-tree-calculated-line-height);
    /* 外側の円と内側の円を重ねて描画するための設定 */
    position: relative;
  }

  /* アイテムツリーのバレットの外側の円（展開状態用） */
  .item-tree-spool_outer-circle {
    /* widthとheightがJavaScriptで設定される */

    border-radius: 50%;
    background: var(--item-tree-bullet-outer-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_outer-circle {
    background: var(--item-tree-bullet-outer-circle-hover-color);
  }

  /* アイテムツリーのバレットの内側の円 */
  .item-tree-spool_inner-circle {
    width: var(--item-tree-bullet-inner-circle-diameter);
    height: var(--item-tree-bullet-inner-circle-diameter);
    border-radius: 50%;
    background: var(--item-tree-bullet-inner-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--item-tree-bullet-inner-circle-hover-color);
  }

  /* ページのバレット */
  .item-tree-spool_page-icon {
    width: var(--bullet-page-icon-size);
    height: var(--bullet-page-icon-size);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: var(--item-tree-bullet-inner-circle-color);
    -webkit-mask-image: url('./page-icon.svg');

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--item-tree-bullet-inner-circle-hover-color);
  }

  /* インデント領域 */
  .item-tree-spool_indent-area {
    position: absolute;
    /* バレットの中心のY座標から子リストの下端までの領域にする */
    top: calc(var(--item-tree-calculated-line-height) / 2);
    height: calc(100% - var(--item-tree-calculated-line-height) / 2);
    width: 100%;
  }

  /* インデントライン */
  .item-tree-spool_indent-line {
    background: var(--item-tree-indent-line-color);
    width: var(--item-tree-indent-line-width);
    height: 100%;
    margin: 0 auto;
  }

  /* バレットとインデントの領域のホバー時のインデントライン */
  .item-tree-spool:hover .item-tree-spool_indent-line {
    background: var(--item-tree-indent-line-hover-color);
  }
</style>
