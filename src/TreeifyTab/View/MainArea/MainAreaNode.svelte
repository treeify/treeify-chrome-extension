<script lang="ts">
  import Color from 'color'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import {onItemDragStart} from '../dragAndDrop'
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
</script>

<div
  class="main-area-node"
  class:multi-selected={props.selected === 'multi'}
  id={JSON.stringify(props.itemPath)}
>
  {#if props.isActivePage}
    <div class="grid-empty-cell" />
  {:else}
    <!-- バレットとインデントラインの領域 -->
    <div
      class={'main-area-node_spool-area ' + props.cssClasses.join(' ')}
      class:transcluded={props.isTranscluded}
      use:onItemDragStart={props.itemPath}
    >
      <MainAreaSpool props={props.spoolProps} />
    </div>
  {/if}
  <div class="main-area-node_body-and-children-area">
    <!-- ボディ領域 -->
    <div class={props.cssClasses.unshift('main-area-node_body-area').join(' ')}>
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

<style>
  :root {
    /* ボディ領域の上下パディング */
    --main-area-body-area-vertical-padding: 0.5px;

    /* フォーカスアイテムの背景色 */
    --main-area-focused-item-background-color: hsl(240, 100%, 96.8%);
    /* マウスホバーアイテムの背景色 */
    --main-area-mouse-hover-item-background-color: hsl(240, 100%, 98.8%);

    /* 複数選択されたアイテムの背景色 */
    --main-area-selected-item-background-color: hsl(216, 89%, 85%);

    /* 最も新しい足跡の色（線形補間の一端） */
    --main-area-strongest-footprint-color: hsl(0, 100%, 97.3%);
    /* 最も古い足跡の色（線形補間の一端） */
    --main-area-weakest-footprint-color: hsl(60, 100%, 97.3%);

    /* グレーアウト状態のアイテムの標準的なテキスト色 */
    --grayed-out-item-text-color: hsl(0, 0%, 75%);

    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --main-area-delete-button-size: 0.8em;
    /* 削除ボタンなどのマウスホバー時の背景 */
    --main-area-node-button-background-hover-color: hsl(0, 0%, 90%);
  }

  .main-area-node {
    /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  /* ボディ領域 */
  .main-area-node_body-area {
    padding: var(--main-area-body-area-vertical-padding) 0;
    /* コンテンツ領域とボタン類を横に並べる */
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .main-area-node_spool-area {
    user-select: none;
  }

  .main-area-node_content-area {
    height: 100%;
  }
  /* マウスホバー時のコンテンツ領域 */
  .main-area-node_content-area:hover {
    /* マウスホバーアイテムの強調表示 */
    background: var(--main-area-mouse-hover-item-background-color);
  }
  /* 単一選択されたアイテムのコンテンツ領域 */
  .single-selected.main-area-node_content-area {
    background: var(--main-area-focused-item-background-color);
  }

  /* ダウトフル状態のアイテム */
  :global(.doubtful) .main-area-node_content-area {
    text-decoration: underline dotted hsl(0, 100%, 70%);
    text-decoration-thickness: 2px;
    text-underline-offset: 0.03em;
  }

  /* 隠れているタブ数 */
  .main-area-node_hidden-tabs-count {
    width: var(--main-area-calculated-line-height);
    height: var(--main-area-calculated-line-height);

    position: relative;
    text-align: center;

    border-radius: 50%;
    cursor: pointer;

    color: hsl(0, 0%, 40%);
  }
  .main-area-node_hidden-tabs-count:hover {
    background: var(--main-area-node-button-background-hover-color);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
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

    background: hsl(0, 0%, 50%);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの開始状態 */
  .main-area-node_hidden-tabs-count:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* 各アイテムの削除ボタン */
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

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 30%);
    -webkit-mask-image: url('close-icon.svg');
  }

  .main-area-node_children-area {
    /* 階層の深さに応じてフォントサイズを小さくする */
    font-size: var(--main-area-font-size-multiplicator);
  }

  /*
  複数選択されたアイテムの背景色設定。
  他の背景色設定（足跡やマウスホバーなど）を上書きするために、いくつものセレクターに対して設定する必要がある。
  CSSの優先順位のためにファイルの下の方で定義する。
  */
  .multi-selected.main-area-node,
  .multi-selected .main-area-node_content-area,
  .multi-selected .main-area-node_body-area {
    background: var(--main-area-selected-item-background-color);
  }
</style>
