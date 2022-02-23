<script lang="ts">
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
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

  :root {
    --bullet-default-size: 0.38em;
    --bullet-default-color: lch(60% 0 0);
    --selected-item-background-default-color: lch(95% 134 280.4);
    --item-hover-background-default-color: lch(98% 134 280.4);
  }

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

    accent-color: lch(50% 134 280.4);
  }

  img {
    vertical-align: top;
  }

  button {
    padding-inline: 1.1em;
    padding-block: 0.3em;
    border-radius: 0.3em;
    border: 1px lch(70% 0 0) solid;

    background: #ffffff;
    color: lch(32.5% 0 0);
    font-weight: 600;

    cursor: pointer;

    &:hover {
      background: lch(97.5% 0 0);
    }

    &:active {
      background: lch(95% 0 0);
    }

    &.primary {
      background: lch(57.5% 67.2 280.4);

      border-color: transparent;

      color: lch(99.3% 0 0);

      &:hover {
        background: lch(55% 67.2 280.4);
      }

      &:active {
        background: lch(52.5% 67.2 280.4);
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
