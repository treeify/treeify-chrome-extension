<script lang="ts">
  import { dragItem } from 'src/TreeifyTab/View/dragAndDrop'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import MainAreaContent from 'src/TreeifyTab/View/MainArea/MainAreaContent.svelte'
  import MainAreaNode from 'src/TreeifyTab/View/MainArea/MainAreaNode.svelte'
  import { MainAreaNodeProps } from 'src/TreeifyTab/View/MainArea/MainAreaNodeProps'
  import MainAreaRoll from 'src/TreeifyTab/View/MainArea/MainAreaRoll.svelte'
  import { RArray$ } from 'src/Utility/fp-ts'

  export let props: MainAreaNodeProps

  const childrenCssClasses = props.cssClasses.map((cssClass) => cssClass + '-children')
  const depth = String(props.itemPath.length - 1)

  const footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--main-area-strongest-footprint-color',
    '--main-area-weakest-footprint-color'
  )?.toString()
</script>

<div
  class="main-area-node_root"
  class:multi-selected={props.selected === 'multi'}
  id={JSON.stringify(props.itemPath)}
  style:--footprint-color={footprintColor ?? 'transparent'}
  style:--depth={depth}
>
  {#if props.isActivePage}
    <div class="grid-empty-cell" />
  {:else}
    <!-- バレットとインデントガイドの領域 -->
    <div
      class={'main-area-node_roll-area ' + props.cssClasses.join(' ')}
      class:transcluded={props.isTranscluded}
      data-depth={depth}
      use:dragItem={props.itemPath}
    >
      <MainAreaRoll props={props.rollProps} />
    </div>
  {/if}
  <div class="main-area-node_body-and-children-area">
    <!-- ボディ領域 -->
    <div
      class={RArray$.prepend('main-area-node_body-area')(props.cssClasses).join(' ')}
      class:excluded={props.isExcluded}
      data-depth={depth}
    >
      <!-- コンテンツ領域 -->
      <div
        data-item-path={JSON.stringify(props.itemPath)}
        class="main-area-node_content-area"
        class:single-selected={props.selected === 'single'}
        on:mousedown={props.onMouseDownContentArea}
        on:contextmenu={props.onContextMenu}
      >
        <MainAreaContent props={props.contentProps} />
      </div>
      {#if props.itemPath.length === 1}
        <div class="grid-empty-cell" />
      {:else if props.hiddenTabsCount > 0}
        <!-- 隠れているタブ数 -->
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
    <div class={RArray$.prepend('main-area-node_children-area')(childrenCssClasses).join(' ')}>
      {#each props.childItemPropses as itemProps (itemProps.itemPath.toString())}
        <MainAreaNode props={itemProps} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --main-area-node-content-area-vertical-padding: 0.105em;

    // フォーカス項目の背景色。lch(95.0%, 134.0, 280.4)相当
    --main-area-focused-item-background-color: #ecf0ff;
    // マウスホバー項目の背景色。lch(98%, 134.0, 280.4)相当
    --main-area-hover-item-background-color: #f7f9ff;

    // 複数選択された項目の背景色。lch(93.0%, 134.0, 280.4)相当
    --main-area-selected-item-background-color: #e5ebff;

    // 最も新しい足跡の色（線形補間の一端）。lch(97.5%, 134.0, 40.4)相当
    --main-area-strongest-footprint-color: #fff6f3;
    // 最も古い足跡の色（線形補間の一端）
    --main-area-weakest-footprint-color: #ffffff;
    // 足跡表示数のパラメータ。
    // CSSではなくJSから参照する特殊なCSS変数。
    // 見た目に関する値なのでカスタムCSSで設定できるようCSS変数として定義した。
    --main-area-footprint-count-exponent: 0.6;

    // 完了状態の項目の標準的なテキスト色。lch(75.0%, 0.0, 0.0)相当
    --completed-item-text-color: #b9b9b9;

    // 削除ボタンなどのマウスホバー時の背景。lch(90.0%, 0.0, 0.0)相当
    --main-area-node-button-background-hover-color: #e2e2e2;
  }

  .main-area-node_root {
    // バレット&インデント領域とボディ&子リスト領域を横に並べる
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  // ボディ領域
  .main-area-node_body-area {
    // コンテンツ領域とボタン類を横に並べる
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;

    &[data-depth='0'] {
      font-size: 125%;
      padding-bottom: 0.5em;
    }

    &.excluded {
      filter: blur(1px);
    }
  }

  .main-area-node_roll-area {
    user-select: none;
  }

  .main-area-node_content-area {
    height: 100%;
    background-color: var(--footprint-color);
    @media print {
      background-color: transparent;
    }

    // マウスホバー時のコンテンツ領域
    &:hover {
      // マウスホバー項目の強調表示
      background: var(--main-area-hover-item-background-color);
      @media print {
        background-color: transparent;
      }
    }

    // 単一選択された項目のコンテンツ領域
    &.single-selected {
      background: var(--main-area-focused-item-background-color);
      @media print {
        background-color: transparent;
      }
    }
  }

  // ダウトフル状態の項目
  .doubtful .main-area-node_content-area {
    // lch(60.0%, 134.0, 40.4)相当
    text-decoration: underline dashed #ff5534;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  // 隠れているタブ数
  .main-area-node_hidden-tabs-count {
    @include common.circle(var(--main-area-calculated-line-height));
    @include common.pseudo-ripple-effect(var(--main-area-node-button-background-hover-color));

    text-align: center;

    // lch(40.0%, 0.0, 0.0)相当
    color: #5e5e5e;
  }

  // 各項目の削除ボタン
  .main-area-node_delete-button {
    @include common.circle(var(--main-area-calculated-line-height));

    // アイコンと疑似リップルエフェクトを中央寄せにする
    position: relative;

    // マウスホバー時にのみ表示
    visibility: hidden;

    // ボタンであることを示す
    cursor: pointer;

    .main-area-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }

    &:hover {
      background: var(--main-area-node-button-background-hover-color);
    }
  }

  .main-area-node_delete-button-icon {
    @include common.square(0.8em);
    @include common.absolute-center;

    // lch(30.0%, 0.0, 0.0)相当
    @include common.icon(#474747, url('close.svg'));
  }

  // 複数選択された項目の背景色設定。
  // 他の背景色設定（足跡やマウスホバーなど）を上書きするために、いくつものセレクターに対して設定する必要がある。
  // CSSの優先順位のためにファイルの下の方で定義する。
  .multi-selected.main-area-node_root,
  .multi-selected .main-area-node_content-area,
  .multi-selected .main-area-node_body-area {
    background: var(--main-area-selected-item-background-color);
  }
</style>
