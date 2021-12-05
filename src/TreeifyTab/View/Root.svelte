<script lang="ts">
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import DialogLayer from 'src/TreeifyTab/View/Dialog/DialogLayer.svelte'
  import { dragStateResetter } from 'src/TreeifyTab/View/dragAndDrop'
  import DragImage from 'src/TreeifyTab/View/DragImage.svelte'
  import LeftSidebar from 'src/TreeifyTab/View/LeftSidebar/LeftSidebar.svelte'
  import MainArea from 'src/TreeifyTab/View/MainArea/MainArea.svelte'
  import { createRootProps, RootProps } from 'src/TreeifyTab/View/RootProps'
  import Toolbar from 'src/TreeifyTab/View/Toolbar/Toolbar.svelte'
  import { derived, Readable } from 'svelte/store'

  const propsStream: Readable<RootProps> = derived(Rerenderer.instance.rerenderingPulse, () => {
    return createRootProps(Internal.instance.state)
  })
</script>

<div class="root" data-workspace-id={$propsStream.currentWorkspaceId} use:dragStateResetter>
  <!--
  カスタムCSSを埋め込む。
  Svelteは動的にstyle要素をhead要素の子リスト末尾に追加するので、尋常な方法ではCSSの優先度で負けてしまう。
  body要素の下にstyle要素を入れることで優先度の問題を解決した。
  またSvelteでは<style>{css}</style>のように書いても動的にCSSを設定できないので、innerHTMLの形で強引に埋め込む。
  -->
  {@html $propsStream.customCssHtml}
  <div class="root_toolbar-and-sidebar-layout">
    <Toolbar props={$propsStream.toolbarProps} />
    <div class="root_sidebar-layout">
      <LeftSidebar props={$propsStream.leftSidebarProps} />
      <MainArea props={$propsStream.mainAreaProps} />
    </div>
  </div>
  <DialogLayer props={$propsStream.dialogLayerProps} />
  {#if $propsStream.dragImageProps !== undefined}
    <DragImage props={$propsStream.dragImageProps} />
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  * {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    font-size: 16px;
  }

  body {
    -webkit-print-color-adjust: exact;

    height: 100%;
    margin: 0;
    font-size: inherit;
  }

  img {
    vertical-align: top;
  }

  .spa-root {
    height: 100%;
  }

  .root {
    height: 100%;
    // ダイアログなどを他の表示物に重ねて表示するための設定
    position: relative;
  }

  // ツールバーとその他の領域を縦に並べるためのレイアウト
  .root_toolbar-and-sidebar-layout {
    // スクロールされてもツールバーを常に画面上部に表示し続けるための設定
    height: 100%;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  // 左サイドバーとメインエリアを横に並べるレイアウト
  .root_sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .default-favicon {
    // lch(40.0%, 0.0, 0.0)相当
    @include common.icon(#5e5e5e, url('./default-favicon.svg'));
  }
</style>
