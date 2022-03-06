<script lang="ts">
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonCssCustomProperty from 'src/TreeifyTab/View/CommonCssCustomProperty.svelte'
  import DialogLayer from 'src/TreeifyTab/View/Dialog/DialogLayer.svelte'
  import { dragStateResetter } from 'src/TreeifyTab/View/dragAndDrop'
  import DragAndDropLayer from 'src/TreeifyTab/View/DragAndDropLayer.svelte'
  import LeftSidebar from 'src/TreeifyTab/View/LeftSidebar/LeftSidebar.svelte'
  import MainArea from 'src/TreeifyTab/View/MainArea/MainArea.svelte'
  import { createRootProps, RootProps } from 'src/TreeifyTab/View/RootProps'
  import Toolbar from 'src/TreeifyTab/View/Toolbar/Toolbar.svelte'
  import { derived, Readable } from 'svelte/store'

  const propsStream: Readable<RootProps> = derived(Rerenderer.instance.rerenderingPulse, () => {
    return createRootProps(Internal.instance.state)
  })
</script>

<CommonCssCustomProperty />
<div
  class="root_root"
  data-workspace-id={$propsStream.currentWorkspaceId}
  data-os-name={$propsStream.osName}
  use:dragStateResetter
>
  {@html $propsStream.customCssHtml}
  <div class="root_toolbar-and-sidebar-layout">
    <Toolbar props={$propsStream.toolbarProps} />
    <div class="root_sidebar-layout">
      <LeftSidebar props={$propsStream.leftSidebarProps} />
      <MainArea props={$propsStream.mainAreaProps} />
    </div>
  </div>
  <DialogLayer props={$propsStream.dialogLayerProps} />
  {#if $propsStream.dragAndDropLayerProps !== undefined}
    <DragAndDropLayer props={$propsStream.dragAndDropLayerProps} />
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

    accent-color: oklch(59% 0.17 255);
  }

  img {
    vertical-align: top;
  }

  button {
    padding-inline: common.toIntegerPx(1.1em);
    padding-block: common.toIntegerPx(0.3em);
    border-radius: common.toIntegerPx(0.3em);
    border: 1px oklch(70% 0 0) solid;

    background: oklch(100% 0 0);
    color: oklch(32.5% 0 0);
    font-weight: 600;

    cursor: pointer;

    &:hover {
      background: oklch(97.5% 0 0);
    }

    &:active {
      background: oklch(95% 0 0);
    }

    &.primary {
      background: oklch(59% 0.17 255);

      border-color: transparent;

      color: oklch(99.5% 0 0);

      &:hover {
        background: oklch(54% 0.17 255);
      }

      &:active {
        background: oklch(51% 0.17 255);
      }
    }
  }

  #spa-root {
    height: 100%;
  }

  .root_root {
    height: 100%;
    // ダイアログなどを他の表示物に重ねて表示するための設定
    position: relative;

    // メインエリアにTeX項目が表示されているときにスクロールバーが出てしまうことがある不具合の対策
    overflow: hidden;
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
</style>
