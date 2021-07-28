<script lang="ts">
  import Color from 'color'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import {dragItem} from '../dragAndDrop'
  import MainAreaContent from './MainAreaContent.svelte'
  import MainAreaNode from './MainAreaNode.svelte'
  import {MainAreaNodeProps} from './MainAreaNodeProps'
  import MainAreaSpool from './MainAreaSpool.svelte'

  export let props: MainAreaNodeProps

  function calculateFootprintColor(
    footprintRank: integer | undefined,
    footprintCount: integer
  ): Color | undefined {
    if (footprintRank === undefined) return undefined

    const strongestColor = CssCustomProperty.getColor('--main-area-strongest-footprint-color')
    const weakestColor = CssCustomProperty.getColor('--main-area-weakest-footprint-color')

    if (footprintCount === 1) {
      return strongestColor
    }

    // 線形補間する
    const ratio = footprintRank / (footprintCount - 1)
    return strongestColor.mix(weakestColor, ratio)
  }

  $: footprintColor = calculateFootprintColor(props.footprintRank, props.footprintCount)
  $: footprintLayerStyle = footprintColor !== undefined ? `background-color: ${footprintColor}` : ''
  $: childrenCssClasses = props.cssClasses.map((cssClass) => cssClass + '-children')
  $: depth = props.itemPath.size - 1
</script>

<div
  class="main-area-node"
  class:multi-selected={props.selected === 'multi'}
  id={JSON.stringify(props.itemPath)}
>
  {#if props.isActivePage}
    <div class="grid-empty-cell" />
  {:else}
    <!-- バレットとインデントガイドの領域 -->
    <div
      class={'main-area-node_spool-area ' + props.cssClasses.join(' ')}
      class:transcluded={props.isTranscluded}
      use:dragItem={props.itemPath}
    >
      <MainAreaSpool props={props.spoolProps} />
    </div>
  {/if}
  <div class="main-area-node_body-and-children-area">
    <!-- ボディ領域 -->
    <div class={props.cssClasses.unshift('main-area-node_body-area').join(' ')} data-depth={depth}>
      <!-- 足跡表示用のレイヤー -->
      <div class="main-area-node_footprint-layer" style={footprintLayerStyle}>
        <!-- コンテンツ領域 -->
        <div
          data-item-path={JSON.stringify(props.itemPath.toArray())}
          class="main-area-node_content-area"
          class:single-selected={props.selected === 'single'}
          on:mousedown={props.onMouseDownContentArea}
          on:contextmenu={props.onContextMenu}
        >
          <MainAreaContent props={props.contentProps} />
        </div>
      </div>
      <!-- 隠れているタブ数 -->
      {#if props.hiddenTabsCount > 0}
        <div class="main-area-node_hidden-tabs-count" on:mousedown={props.onClickHiddenTabsCount}>
          {Math.min(99, props.hiddenTabsCount)}
        </div>
      {:else}
        <!-- 削除ボタン -->
        <div class="main-area-node_delete-button" on:mousedown={props.onClickDeleteButton}>
          <div class="main-area-node_delete-button-icon" />
        </div>
      {/if}
    </div>
    <!-- 子リスト領域 -->
    <div class={childrenCssClasses.unshift('main-area-node_children-area').join(' ')}>
      {#each props.childItemPropses.toArray() as itemProps (itemProps.itemPath.toString())}
        <MainAreaNode props={itemProps} />
      {/each}
    </div>
  </div>
</div>

<style global>
  :root {
    /* ボディ領域の上下パディング */
    --main-area-body-area-vertical-padding: 0.08em;

    /* フォーカス項目の背景色。lch(95.0%, 7.8, 280.4)相当 */
    --main-area-focused-item-background-color: #ecf0ff;
    /* マウスホバー項目の背景色。lch(97.5%, 3.6, 280.4)相当 */
    --main-area-mouse-hover-item-background-color: #f6f8ff;

    /* 複数選択された項目の背景色。lch(93.0%, 134.0, 280.4)相当 */
    --main-area-selected-item-background-color: #e5ebff;

    /* 最も新しい足跡の色（線形補間の一端）。lch(97.5%, 3.5, 40.4)相当 */
    --main-area-strongest-footprint-color: #fff6f3;
    /* 最も古い足跡の色（線形補間の一端） */
    --main-area-weakest-footprint-color: #ffffff;

    /* グレーアウト状態の項目の標準的なテキスト色。lch(75.0%, 0.0, 0.0)相当 */
    --grayed-out-item-text-color: #b9b9b9;

    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --main-area-delete-button-size: 0.8em;
    /* 削除ボタンなどのマウスホバー時の背景。lch(90.0%, 0.0, 0.0)相当 */
    --main-area-node-button-background-hover-color: #e2e2e2;
  }

  .main-area-node {
    /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  /* ボディ領域 */
  .main-area-node_body-area {
    /* コンテンツ領域とボタン類を横に並べる */
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .main-area-node_body-area[data-depth='0'] {
    font-size: 120%;
  }

  .main-area-node_footprint-layer {
    padding: var(--main-area-body-area-vertical-padding) 0;
  }

  .main-area-node_spool-area {
    user-select: none;
  }

  .main-area-node_content-area {
    height: 100%;
  }
  /* マウスホバー時のコンテンツ領域 */
  .main-area-node_content-area:hover {
    /* マウスホバー項目の強調表示 */
    background: var(--main-area-mouse-hover-item-background-color);
  }
  /* 単一選択された項目のコンテンツ領域 */
  .single-selected.main-area-node_content-area {
    background: var(--main-area-focused-item-background-color);
  }

  /* ダウトフル状態の項目 */
  .doubtful .main-area-node_content-area {
    /* lch(60.0%, 134.0, 160.4)相当 */
    text-decoration: underline dotted #00a570;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.1em;
  }

  /* 隠れているタブ数 */
  .main-area-node_hidden-tabs-count {
    width: var(--main-area-calculated-line-height);
    height: var(--main-area-calculated-line-height);

    position: relative;
    text-align: center;

    border-radius: 50%;
    cursor: pointer;

    /* lch(40.0%, 0.0, 0.0)相当 */
    color: #5e5e5e;
  }
  .main-area-node_hidden-tabs-count:hover {
    background: var(--main-area-node-button-background-hover-color);
  }
  /* 疑似リップルエフェクトの終了状態 */
  .main-area-node_hidden-tabs-count::after {
    content: '';

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s, width 0.5s, height 0.5s;

    border-radius: 50%;

    /* lch(50.0%, 0.0, 0.0)相当 */
    background: #777777;
  }
  /* 疑似リップルエフェクトの開始状態 */
  .main-area-node_hidden-tabs-count:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* 各項目の削除ボタン */
  .main-area-node_delete-button {
    width: var(--main-area-calculated-line-height);
    height: var(--main-area-calculated-line-height);

    border-radius: 50%;

    /* アイコンと疑似リップルエフェクトを中央寄せにする */
    position: relative;

    /* マウスホバー時にのみ表示 */
    visibility: hidden;

    /* ボタンであることを示す */
    cursor: pointer;
  }
  .main-area-node_body-area:hover .main-area-node_delete-button {
    /* マウスホバー時にのみ表示 */
    visibility: visible;
  }
  .main-area-node_delete-button:hover {
    background: var(--main-area-node-button-background-hover-color);
  }

  .main-area-node_delete-button-icon {
    width: var(--main-area-delete-button-size);
    height: var(--main-area-delete-button-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(30.0%, 0.0, 0.0)相当 */
    background: #474747;
    -webkit-mask-image: url('close-icon.svg');
  }

  .main-area-node_children-area {
    /* 階層が深くなるごとにフォントサイズを小さくする */
    font-size: 99.5%;
  }

  /*
  複数選択された項目の背景色設定。
  他の背景色設定（足跡やマウスホバーなど）を上書きするために、いくつものセレクターに対して設定する必要がある。
  CSSの優先順位のためにファイルの下の方で定義する。
  */
  .multi-selected.main-area-node,
  .multi-selected .main-area-node_content-area,
  .multi-selected .main-area-node_body-area {
    background: var(--main-area-selected-item-background-color);
  }
</style>
