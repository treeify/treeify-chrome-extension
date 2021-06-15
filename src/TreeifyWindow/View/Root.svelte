<script lang="ts">
  import {List} from 'immutable'
  import {Internal} from 'src/TreeifyWindow/Internal/Internal'
  import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
  import {createRootViewModel} from 'src/TreeifyWindow/View/RootView'
  import {derived, Readable} from 'svelte/store'
  import {TOP_ITEM_ID} from '../basicType'
  import {doWithErrorCapture} from '../errorCapture'
  import {toOpmlString} from '../Internal/importAndExport'
  import DataFolderPickerOpenButton from './DataFolderPickerOpenButton.svelte'
  import {DataFolderPickerOpenButtonViewModel} from './DataFolderPickerOpenButtonView'
  import CodeBlockItemEditDialog from './Dialog/CodeBlockItemEditDialog.svelte'
  import {CodeBlockItemEditDialogViewModel} from './Dialog/CodeBlockItemEditDialogView'
  import DefaultWindowModeSettingDialog from './Dialog/DefaultWindowModeSettingDialog.svelte'
  import {DefaultWindowModeSettingDialogViewModel} from './Dialog/DefaultWindowModeSettingDialogView'
  import LabelEditDialog from './Dialog/LabelEditDialog.svelte'
  import {LabelEditDialogViewModel} from './Dialog/LabelEditDialogView'
  import OtherParentsDialog from './Dialog/OtherParentsDialog.svelte'
  import {OtherParentsDialogViewModel} from './Dialog/OtherParentsDialogView'
  import WebPageItemTitleSettingDialog from './Dialog/WebPageItemTitleSettingDialog.svelte'
  import {WebPageItemTitleSettingDialogViewModel} from './Dialog/WebPageItemTitleSettingDialogView'
  import WorkspaceDialog from './Dialog/WorkspaceDialog.svelte'
  import {WorkspaceDialogViewModel} from './Dialog/WorkspaceDialogView'
  import FullWindowModeButton from './FullWindowModeButton.svelte'
  import ItemTree from './ItemTree/ItemTree.svelte'
  import {ItemTreeViewModel} from './ItemTree/ItemTreeView'
  import LeftSidebar from './LeftSidebar/LeftSidebar.svelte'
  import {LeftSidebarViewModel} from './LeftSidebar/LeftSidebarView'

  type RootViewModel = {
    leftSidebarViewModel: LeftSidebarViewModel | undefined
    itemTreeViewModel: ItemTreeViewModel
    webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
    codeBlockItemEditDialogViewModel: CodeBlockItemEditDialogViewModel | undefined
    defaultWindowModeSettingDialog: DefaultWindowModeSettingDialogViewModel | undefined
    workspaceDialog: WorkspaceDialogViewModel | undefined
    labelEditDialog: LabelEditDialogViewModel | undefined
    otherParentsDialog: OtherParentsDialogViewModel | undefined
    dataFolderPickerOpenButtonViewModel: DataFolderPickerOpenButtonViewModel
  }

  const viewModelStream: Readable<RootViewModel> = derived(
    Rerenderer.instance.rerenderingPulse,
    () => {
      return createRootViewModel(Internal.instance.state)
    }
  )
  $: viewModel = $viewModelStream

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
      <DataFolderPickerOpenButton viewModel={viewModel.dataFolderPickerOpenButtonViewModel} />
    </div>
    <div class="sidebar-layout">
      {#if viewModel.leftSidebarViewModel !== undefined}
        <LeftSidebar viewModel={viewModel.leftSidebarViewModel} />
      {:else}
        <div class="grid-empty-cell" />
      {/if}
      <ItemTree viewModel={viewModel.itemTreeViewModel} />
    </div>
  </div>
  {#if viewModel.webPageItemTitleSettingDialog !== undefined}
    <WebPageItemTitleSettingDialog viewModel={viewModel.webPageItemTitleSettingDialog} />
  {/if}
  {#if viewModel.codeBlockItemEditDialogViewModel !== undefined}
    <CodeBlockItemEditDialog viewModel={viewModel.codeBlockItemEditDialogViewModel} />
  {/if}
  {#if viewModel.defaultWindowModeSettingDialog !== undefined}
    <DefaultWindowModeSettingDialog viewModel={viewModel.defaultWindowModeSettingDialog} />
  {/if}
  {#if viewModel.workspaceDialog !== undefined}
    <WorkspaceDialog viewModel={viewModel.workspaceDialog} />
  {/if}
  {#if viewModel.labelEditDialog !== undefined}
    <LabelEditDialog viewModel={viewModel.labelEditDialog} />
  {/if}
  {#if viewModel.otherParentsDialog !== undefined}
    <OtherParentsDialog viewModel={viewModel.otherParentsDialog} />
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

  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    height: 100%;
  }

  :global(body) {
    height: 100%;
    margin: 0;
  }

  :global(.spa-root) {
    height: 100%;
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

  /* ツールバーのアイコンボタンの共通クラス */
  :global(.toolbar-icon-button) {
    width: var(--toolbar-icon-button-size);
    height: var(--toolbar-icon-button-size);
    border-radius: 50%;

    cursor: pointer;

    /* アイコンと疑似リップルエフェクトを中央寄せにする */
    position: relative;
  }
  :global(.toolbar-icon-button):hover {
    background: var(--toolbar-icon-button-hover-background);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
  :global(.toolbar-icon-button)::after {
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
  :global(.toolbar-icon-button):active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* 左サイドバーとアイテムツリーを横に並べるレイアウト */
  .sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
</style>
