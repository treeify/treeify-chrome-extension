<script lang="ts">
  import Color from 'color'
  import {List} from 'immutable'
  import {integer} from '../../../Common/integer'
  import {CssCustomProperty} from '../../CssCustomProperty'
  import {ItemPath} from '../../Internal/ItemPath'
  import {classMap} from '../createElement'
  import ItemTreeContent from './ItemTreeContent.svelte'
  import {ItemTreeContentView, ItemTreeContentViewModel} from './ItemTreeContentView'
  import ItemTreeNode from './ItemTreeNode.svelte'
  import ItemTreeSpool from './ItemTreeSpool.svelte'
  import {ItemTreeSpoolViewModel} from './ItemTreeSpoolView'

  type ItemTreeNodeViewModel = {
    itemPath: ItemPath
    isActivePage: boolean
    /**
     * このアイテムが選択されているかどうかを示す値。
     * 複数選択されたアイテムのうちの1つならmulti。
     * 単一選択されたアイテムならsingle。
     * 選択されていないならnon。
     */
    selected: 'single' | 'multi' | 'non'
    isTranscluded: boolean
    cssClasses: List<string>
    footprintRank: integer | undefined
    footprintCount: integer
    hiddenTabsCount: integer
    contentViewModel: ItemTreeContentViewModel
    childItemViewModels: List<ItemTreeNodeViewModel>
    spoolViewModel: ItemTreeSpoolViewModel
    onMouseDownContentArea: (event: MouseEvent) => void
    onClickDeleteButton: (event: MouseEvent) => void
    onDragStart: (event: DragEvent) => void
    onClickHiddenTabsCount: (event: MouseEvent) => void
  }

  export let viewModel: ItemTreeNodeViewModel

  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)

  function calculateFootprintColor(
    footprintRank: integer | undefined,
    footprintCount: integer
  ): Color | undefined {
    if (footprintRank === undefined) return undefined

    const strongestColor = CssCustomProperty.getColor('--item-tree-strongest-footprint-color')
    const weakestColor = CssCustomProperty.getColor('--item-tree-weakest-footprint-color')

    if (footprintCount === 1) {
      return strongestColor
    }

    // 線形補間する
    const ratio = footprintRank / (footprintCount - 1)
    return strongestColor.mix(weakestColor, ratio)
  }

  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const footprintLayerStyle =
    footprintColor !== undefined ? `background-color: ${footprintColor}` : ''
  const childrenCssClasses = viewModel.cssClasses.map((cssClass) => cssClass + '-children')
</script>

<div
  class={classMap({
    'item-tree-node': true,
    'multi-selected': viewModel.selected === 'multi',
  })}
>
  {#if viewModel.isActivePage}
    <div class="grid-empty-cell" />
  {:else}
    <!-- バレットとインデントラインの領域 -->
    <div
      class={classMap({
        'item-tree-node_spool-area': true,
        transcluded: viewModel.isTranscluded,
        ...Object.fromEntries(viewModel.cssClasses.map((cssClass) => [cssClass, true])),
      })}
      draggable="true"
      on:dragstart={viewModel.onDragStart}
    >
      <ItemTreeSpool viewModel={viewModel.spoolViewModel} />
    </div>
  {/if}
  <div class="item-tree-node_body-and-children-area">
    <!-- ボディ領域 -->
    <div class={viewModel.cssClasses.unshift('item-tree-node_body-area').join(' ')}>
      <!-- 足跡表示用のレイヤー -->
      <div class="item-tree-node_footprint-layer" style={footprintLayerStyle}>
        <!-- コンテンツ領域 -->
        <div
          data-item-path={JSON.stringify(viewModel.itemPath.toArray())}
          class={classMap({
            'item-tree-node_content-area': true,
            'single-selected': viewModel.selected === 'single',
          })}
          on:mousedown={viewModel.onMouseDownContentArea}
        >
          <ItemTreeContent viewModel={viewModel.contentViewModel} />
        </div>
      </div>
      <!-- 隠れているタブ数 -->
      {#if viewModel.hiddenTabsCount > 0}
        <div class="item-tree-node_hidden-tabs-count" on:click={viewModel.onClickHiddenTabsCount}>
          {Math.min(99, viewModel.hiddenTabsCount)}
        </div>
      {:else}
        <div class="grid-empty-cell" />
      {/if}
      <!-- 削除ボタン -->
      <div class="item-tree-node_delete-button" on:click={viewModel.onClickDeleteButton}>
        <div class="item-tree-node_delete-button-icon" />
      </div>
    </div>
    <!-- 子リスト領域 -->
    <div class={childrenCssClasses.unshift('item-tree-node_children-area').join(' ')}>
      {#each viewModel.childItemViewModels.toArray() as itemViewModel (itemViewModel.itemPath.toString())}
        <ItemTreeNode viewModel={itemViewModel} />
      {/each}
    </div>
  </div>
</div>

<style>
  :root {
    /* ボディ領域の上下パディング */
    --item-tree-body-area-vertical-padding: 0.5px;

    /* フォーカスアイテムの背景色 */
    --item-tree-focused-item-background-color: hsl(240, 100%, 96.8%);
    /* マウスホバーアイテムの背景色 */
    --item-tree-mouse-hover-item-background-color: hsl(240, 100%, 98.8%);

    /* 複数選択されたアイテムの背景色 */
    --item-tree-selected-item-background-color: hsl(216, 89%, 85%);

    /* 最も新しい足跡の色（線形補間の一端） */
    --item-tree-strongest-footprint-color: hsl(0, 100%, 97.3%);
    /* 最も古い足跡の色（線形補間の一端） */
    --item-tree-weakest-footprint-color: hsl(60, 100%, 97.3%);

    /* グレーアウト状態のアイテムの標準的なテキスト色 */
    --grayed-out-item-text-color: hsl(0, 0%, 75%);

    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --item-tree-delete-button-size: 0.8em;
    /* 削除ボタンなどのマウスホバー時の背景 */
    --item-tree-node-button-background-hover-color: hsl(0, 0%, 90%);
  }

  .item-tree-node {
    /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  /* ボディ領域 */
  .item-tree-node_body-area {
    padding: var(--item-tree-body-area-vertical-padding) 0;
    /* コンテンツ領域とボタン類を横に並べる */
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

  .item-tree-node_content-area {
    height: 100%;
  }
  /* マウスホバー時のコンテンツ領域 */
  .item-tree-node_content-area:hover {
    /* マウスホバーアイテムの強調表示 */
    background: var(--item-tree-mouse-hover-item-background-color);
  }
  /* 単一選択されたアイテムのコンテンツ領域 */
  .single-selected.item-tree-node_content-area {
    background: var(--item-tree-focused-item-background-color);
  }

  /* 隠れているタブ数 */
  .item-tree-node_hidden-tabs-count {
    width: var(--item-tree-calculated-line-height);
    height: var(--item-tree-calculated-line-height);

    position: relative;
    text-align: center;

    border-radius: 50%;
    cursor: pointer;
  }
  .item-tree-node_hidden-tabs-count:hover {
    background: var(--item-tree-node-button-background-hover-color);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
  .item-tree-node_hidden-tabs-count::after {
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
  .item-tree-node_hidden-tabs-count:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* 各アイテムの削除ボタン */
  .item-tree-node_delete-button {
    width: var(--item-tree-calculated-line-height);
    height: var(--item-tree-calculated-line-height);

    border-radius: 50%;

    /* アイコンと疑似リップルエフェクトを中央寄せにする */
    position: relative;

    /* マウスホバー時にのみ表示 */
    visibility: hidden;

    /* ボタンであることを示す */
    cursor: pointer;
  }
  .item-tree-node_body-area:hover .item-tree-node_delete-button {
    /* マウスホバー時にのみ表示 */
    visibility: visible;
  }
  .item-tree-node_delete-button:hover {
    background: var(--item-tree-node-button-background-hover-color);
  }

  .item-tree-node_delete-button-icon {
    width: var(--item-tree-delete-button-size);
    height: var(--item-tree-delete-button-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 30%);
    -webkit-mask-image: url('close-icon.svg');
  }

  .item-tree-node_children-area {
    /* 階層の深さに応じてフォントサイズを小さくする */
    font-size: var(--item-tree-font-size-multiplicator);
  }

  /*
    複数選択されたアイテムの背景色設定。
    他の背景色設定（足跡やマウスホバーなど）を上書きするために、いくつものセレクターに対して設定する必要がある。
    CSSの優先順位のためにファイルの下の方で定義する。
    */
  .multi-selected.item-tree-node,
  .multi-selected .item-tree-node_content-area,
  .multi-selected .item-tree-node_body-area {
    background: var(--item-tree-selected-item-background-color);
  }
</style>
