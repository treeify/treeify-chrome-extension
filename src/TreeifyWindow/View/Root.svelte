<script lang="ts">
  import {List} from 'immutable'
  import {Internal} from 'src/TreeifyWindow/Internal/Internal'
  import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
  import {createRootProps, RootProps} from 'src/TreeifyWindow/View/RootProps'
  import {derived, Readable} from 'svelte/store'
  import {TOP_ITEM_ID} from '../basicType'
  import {doWithErrorCapture} from '../errorCapture'
  import {toOpmlString} from '../Internal/importAndExport'
  import DataFolderPickerOpenButton from './DataFolderPickerOpenButton.svelte'
  import CodeBlockItemEditDialog from './Dialog/CodeBlockItemEditDialog.svelte'
  import DefaultWindowModeSettingDialog from './Dialog/DefaultWindowModeSettingDialog.svelte'
  import LabelEditDialog from './Dialog/LabelEditDialog.svelte'
  import OtherParentsDialog from './Dialog/OtherParentsDialog.svelte'
  import WebPageItemTitleSettingDialog from './Dialog/WebPageItemTitleSettingDialog.svelte'
  import WorkspaceDialog from './Dialog/WorkspaceDialog.svelte'
  import FullWindowModeButton from './FullWindowModeButton.svelte'
  import ItemTree from './ItemTree/ItemTree.svelte'
  import LeftSidebar from './LeftSidebar/LeftSidebar.svelte'

  const propsStream: Readable<RootProps> = derived(Rerenderer.instance.rerenderingPulse, () => {
    return createRootProps(Internal.instance.state)
  })
  $: props = $propsStream

  function onClickExportButton() {
    doWithErrorCapture(() => {
      const fileName = 'treeify.opml'

      const content = toOpmlString(List.of(List.of(TOP_ITEM_ID)))
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
      aElement.download = fileName
      aElement.click()
    })
  }
</script>

<div class="root">
  <div class="toolbar-and-sidebar-layout">
    <div class="toolbar">
      <!-- TODO: このボタンはここではなく設定画面の中にあるべき -->
      <button on:click={onClickExportButton}>OPMLファイルをエクスポート</button>
      <FullWindowModeButton />
      <DataFolderPickerOpenButton props={props.dataFolderPickerOpenButtonProps} />
    </div>
    <div class="sidebar-layout">
      {#if props.leftSidebarProps !== undefined}
        <LeftSidebar props={props.leftSidebarProps} />
      {:else}
        <div class="grid-empty-cell" />
      {/if}
      <ItemTree props={props.itemTreeProps} />
    </div>
  </div>
  {#if props.webPageItemTitleSettingDialog !== undefined}
    <WebPageItemTitleSettingDialog props={props.webPageItemTitleSettingDialog} />
  {/if}
  {#if props.codeBlockItemEditDialogProps !== undefined}
    <CodeBlockItemEditDialog props={props.codeBlockItemEditDialogProps} />
  {/if}
  {#if props.defaultWindowModeSettingDialog !== undefined}
    <DefaultWindowModeSettingDialog props={props.defaultWindowModeSettingDialog} />
  {/if}
  {#if props.workspaceDialog !== undefined}
    <WorkspaceDialog props={props.workspaceDialog} />
  {/if}
  {#if props.labelEditDialog !== undefined}
    <LabelEditDialog props={props.labelEditDialog} />
  {/if}
  {#if props.otherParentsDialog !== undefined}
    <OtherParentsDialog props={props.otherParentsDialog} />
  {/if}
</div>

<style>
  :root {
    /* ツールバーの高さ */
    --toolbar-height: 36px;
    /* ツールバーの背景 */
    --toolbar-background: hsl(0, 0%, 96%);

    /* ツールバーのボタンのサイズ（正方形の一辺の長さ） */
    --toolbar-icon-button-size: 32px;
    /* ツールバーのボタンのマウスホバー時の背景 */
    --toolbar-icon-button-hover-background: hsl(0, 0%, 90%);
  }

  .root {
    height: 100%;
    /* ダイアログなどを他の表示物に重ねて表示するための設定 */
    position: relative;
  }

  /*
    ツールバーとその他の領域を縦に並べるためのレイアウト。
    「その他の領域」と言ってもダイアログなどの浮いた存在は含めない（フローティングサイドバーは浮いているがここに含む）。
    */
  .toolbar-and-sidebar-layout {
    /* スクロールされてもツールバーを常に画面上部に表示し続けるための設定 */
    height: 100%;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .toolbar {
    /* ボタンなどを横に並べる */
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* 左サイドバーにも影が落ちるように左サイドバーより高くする */
    position: relative;
    z-index: 2;

    height: var(--toolbar-height);

    background: var(--toolbar-background);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 0 1.5px 3px hsl(0, 0%, 85%);
  }

  /* 左サイドバーとアイテムツリーを横に並べるレイアウト */
  .sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
</style>
