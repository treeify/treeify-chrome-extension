<script lang="ts">
  import {Internal} from 'src/TreeifyWindow/Internal/Internal'
  import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
  import {createRootProps, RootProps} from 'src/TreeifyWindow/View/RootProps'
  import {derived, Readable} from 'svelte/store'
  import CodeBlockItemEditDialog from './Dialog/CodeBlockItemEditDialog.svelte'
  import DefaultWindowModeSettingDialog from './Dialog/DefaultWindowModeSettingDialog.svelte'
  import LabelEditDialog from './Dialog/LabelEditDialog.svelte'
  import OtherParentsDialog from './Dialog/OtherParentsDialog.svelte'
  import SearchDialog from './Dialog/SearchDialog.svelte'
  import TexEditDialog from './Dialog/TexEditDialog.svelte'
  import WebPageItemTitleSettingDialog from './Dialog/WebPageItemTitleSettingDialog.svelte'
  import WorkspaceDialog from './Dialog/WorkspaceDialog.svelte'
  import LeftSidebar from './LeftSidebar/LeftSidebar.svelte'
  import ItemTree from './MainArea/MainArea.svelte'
  import Toolbar from './Toolbar/Toolbar.svelte'

  const propsStream: Readable<RootProps> = derived(Rerenderer.instance.rerenderingPulse, () => {
    return createRootProps(Internal.instance.state)
  })
  $: props = $propsStream
</script>

<div class="root">
  <div class="toolbar-and-sidebar-layout">
    <Toolbar props={props.toolbarProps} />
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
  {#if props.texEditDialogProps !== undefined}
    <TexEditDialog props={props.texEditDialogProps} />
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
  {#if props.searchDialog !== undefined}
    <SearchDialog props={props.searchDialog} />
  {/if}
</div>

<style>
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

  /* 左サイドバーとメインエリアを横に並べるレイアウト */
  .sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
</style>
