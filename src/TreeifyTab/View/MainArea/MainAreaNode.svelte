<script lang="ts">
  import { dragItem } from 'src/TreeifyTab/View/dragAndDrop'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import MainAreaBulletAndIndent from 'src/TreeifyTab/View/MainArea/MainAreaBulletAndIndent.svelte'
  import MainAreaContent from 'src/TreeifyTab/View/MainArea/MainAreaContent.svelte'
  import MainAreaNode from 'src/TreeifyTab/View/MainArea/MainAreaNode.svelte'
  import { MainAreaNodeProps } from 'src/TreeifyTab/View/MainArea/MainAreaNodeProps'
  import { RArray$ } from 'src/Utility/fp-ts'

  export let props: MainAreaNodeProps

  $: childrenCssClasses = props.cssClasses.map((cssClass) => cssClass + '-children')
  $: depth = String(props.itemPath.length - 1)

  $: footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--newest-footprint-color',
    '--oldest-footprint-color'
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
      class={'main-area-node_bullet-and-indent ' + props.cssClasses.join(' ')}
      class:transcluded={props.isTranscluded}
      data-depth={depth}
      use:dragItem={props.itemPath}
    >
      <MainAreaBulletAndIndent props={props.bulletAndIndentProps} />
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
        on:contextmenu={props.onContextMenuContentArea}
      >
        <MainAreaContent props={props.contentProps} />
      </div>
      <div class="main-area-node_right-button-area">
        {#if props.itemPath.length !== 1}
          {#if props.hiddenTabsCount > 0}
            <!-- 隠れているタブ数 -->
            <div
              class="main-area-node_hidden-tabs-count"
              on:mousedown={props.onClickHiddenTabsCount}
              on:contextmenu={props.onContextMenuTabsCount}
            >
              {Math.min(99, props.hiddenTabsCount)}
            </div>
          {:else}
            <!-- 削除ボタン -->
            <div class="main-area-node_delete-button" on:mousedown={props.onClickDeleteButton}>
              <div class="main-area-node_delete-button-icon" />
            </div>
          {/if}
        {/if}
      </div>
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

    // 足跡表示数のパラメータ。
    // CSSではなくJSから参照する特殊なCSS変数。
    // 見た目に関する値なのでカスタムCSSで設定できるようCSS変数として定義した。
    --main-area-footprint-count-exponent: 0.6;
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

  .main-area-node_bullet-and-indent {
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
      background: var(--item-hover-background-color);
      @media print {
        background-color: transparent;
      }
    }

    // 単一選択された項目のコンテンツ領域
    &.single-selected {
      background: var(--selected-item-background-color);
      @media print {
        background-color: transparent;
      }
    }
  }

  // ダウトフル状態の項目
  .doubtful .main-area-node_content-area {
    // 彩度は色域境界値
    text-decoration: underline dashed lch(60% 82.6 40.4);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  .main-area-node_right-button-area {
    @include common.size(var(--main-area-calculated-line-height));

    @include common.flex-center;
  }

  .main-area-node_hidden-tabs-count {
    @include common.circle(1.6em);
    @include common.pseudo-ripple-effect(var(--circle-button-hover-color));

    @include common.flex-center;

    color: lch(40% 0 0);

    font-size: 97%;
  }

  .main-area-node_delete-button {
    @include common.circle(1.6em);
    @include common.pseudo-ripple-effect(var(--circle-button-hover-color));

    // マウスホバー時にのみ表示
    visibility: hidden;

    .main-area-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }
  }

  .main-area-node_delete-button-icon {
    @include common.size(0.8em);
    @include common.absolute-center;

    @include common.icon(lch(30% 0 0), url('close.svg'));
  }

  // 複数選択された項目の背景色設定。
  // 他の背景色設定（足跡やマウスホバーなど）を上書きするために、いくつものセレクターに対して設定する必要がある。
  // CSSの優先順位のためにファイルの下の方で定義する。
  .multi-selected.main-area-node_root,
  .multi-selected .main-area-node_content-area,
  .multi-selected .main-area-node_body-area {
    background: var(--selected-item-background-color);
  }
</style>
