<script lang="ts">
  import { dtdd } from 'src/TreeifyTab/other'
  import { dragItem } from 'src/TreeifyTab/View/dragAndDrop'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import GridEmptyCell from 'src/TreeifyTab/View/GridEmptyCell.svelte'
  import MainAreaBulletAndIndent from 'src/TreeifyTab/View/MainArea/MainAreaBulletAndIndent.svelte'
  import MainAreaContent from 'src/TreeifyTab/View/MainArea/MainAreaContent.svelte'
  import MainAreaNode from 'src/TreeifyTab/View/MainArea/MainAreaNode.svelte'
  import { MainAreaNodeProps } from 'src/TreeifyTab/View/MainArea/MainAreaNodeProps'

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
    <GridEmptyCell />
  {:else}
    <!-- バレットとインデントガイドの領域 -->
    <div
      class="main-area-node_bullet-and-indent {props.cssClasses.join(' ')}"
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
      class="main-area-node_body-area {props.cssClasses.join(' ')}"
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
          {#if props.tabsCount > 0}
            <!-- 隠れているタブ数 -->
            <div
              class="main-area-node_tabs-count"
              title={[
                dtdd('クリック', 'ツリーに紐づくタブを閉じる'),
                dtdd('右クリック', 'タブ一覧ダイアログを表示'),
              ].join('\n')}
              on:mousedown={props.onClickTabsCount}
              on:contextmenu={props.onContextMenuTabsCount}
            >
              {Math.min(99, props.tabsCount)}
            </div>
          {:else}
            <!-- 削除ボタン -->
            <div
              class="main-area-node_delete-button"
              title={[
                dtdd('クリック', 'このツリーを削除'),
                dtdd('Ctrl+クリック', 'この項目単体を削除'),
              ].join('\n')}
              on:mousedown={props.onClickDeleteButton}
            >
              <div class="main-area-node_delete-button-icon" />
            </div>
          {/if}
        {/if}
      </div>
    </div>
    <!-- 子リスト領域 -->
    <div class="main-area-node_children-area {childrenCssClasses.join(' ')}">
      {#each props.childItemPropses as itemProps (itemProps.itemPath.toString())}
        <MainAreaNode props={itemProps} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --main-area-node-content-area-vertical-padding: #{common.toIntegerPx(0.105em)};

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
      padding-bottom: common.toIntegerPx(0.5em);
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

    [data-depth='0'] & {
      font-size: 125%;
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
    text-decoration: var(--doubtful-item-decoration);
    text-decoration-thickness: var(--doubtful-item-decoration-thickness);
    text-underline-offset: var(--doubtful-item-decoration-underline-offset);
  }

  .main-area-node_right-button-area {
    @include common.size(var(--main-area-calculated-line-height));

    @include common.flex-center;
  }

  .main-area-node_tabs-count {
    @include common.circle(common.toIntegerPx(1.6em));
    @include common.pseudo-ripple-effect(var(--circle-button-hover-color));

    @include common.flex-center;

    color: oklch(40% 0 0);

    font-size: 97%;
  }

  .main-area-node_delete-button {
    @include common.circle(common.toIntegerPx(1.6em));
    @include common.pseudo-ripple-effect(var(--circle-button-hover-color));

    // マウスホバー時にのみ表示
    visibility: hidden;

    .main-area-node_body-area:hover & {
      // マウスホバー時にのみ表示
      visibility: visible;
    }
  }

  .main-area-node_delete-button-icon {
    @include common.size(common.toIntegerPx(0.8em));
    @include common.absolute-center;

    @include common.icon(oklch(30% 0 0), url('close.svg'));
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
