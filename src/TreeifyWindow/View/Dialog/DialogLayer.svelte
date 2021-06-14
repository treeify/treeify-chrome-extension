<script context="module" lang="ts">
  import {Readable} from 'svelte/store'
  import {Internal} from '../../Internal/Internal'
  import {State} from '../../Internal/State'
  import CodeBlockItemEditDialog, {createCodeBlockItemEditDialogProps} from './CodeBlockItemEditDialog.svelte'
  import DefaultWindowModeSettingDialog, {createDefaultWindowModeSettingDialogProps} from './DefaultWindowModeSettingDialog.svelte'
  import LabelEditDialog, {createLabelEditDialogProps} from './LabelEditDialog.svelte'
  import OtherParentsDialog, {createOtherParentsDialogProps} from './OtherParentsDialog.svelte'
  import WebPageItemTitleSettingDialog, {createWebPageItemTitleSettingDialogProps} from './WebPageItemTitleSettingDialog.svelte'
  import WorkspaceDialog, {createWorkspaceDialogProps} from './WorkspaceDialog.svelte'

  export function createDialogLayerProps() {
    const state = Internal.instance.state
    return {
      webPageItemTitleSettingDialog: Internal.d(() => state.webPageItemTitleSettingDialog),
      codeBlockItemEditDialog: Internal.d(() => state.codeBlockItemEditDialog),
      defaultWindowModeSettingDialog: Internal.d(() => state.defaultWindowModeSettingDialog),
      workspaceDialog: Internal.d(() => state.workspaceDialog),
      labelEditDialog: Internal.d(() => state.labelEditDialog),
      otherParentsDialog: Internal.d(() => state.otherParentsDialog),
    }
  }
</script>

<script lang="ts">
  export let webPageItemTitleSettingDialog: Readable<State.WebPageItemTitleSettingDialog | null>
  export let codeBlockItemEditDialog: Readable<State.CodeBlockItemEditDialog | null>
  export let defaultWindowModeSettingDialog: Readable<State.DefaultWindowModeSettingDialog | null>
  export let workspaceDialog: Readable<State.WorkspaceDialog | null>
  export let labelEditDialog: Readable<State.LabelEditDialog | null>
  export let otherParentsDialog: Readable<State.OtherParentsDialog | null>
</script>

{#if $webPageItemTitleSettingDialog !== null}
  <WebPageItemTitleSettingDialog
    {...createWebPageItemTitleSettingDialogProps($webPageItemTitleSettingDialog)}
  />
{/if}
{#if $codeBlockItemEditDialog !== null}
  <CodeBlockItemEditDialog {...createCodeBlockItemEditDialogProps($codeBlockItemEditDialog)} />
{/if}
{#if $defaultWindowModeSettingDialog !== null}
  <DefaultWindowModeSettingDialog {...createDefaultWindowModeSettingDialogProps()} />
{/if}
{#if $workspaceDialog !== null}
  <WorkspaceDialog {...createWorkspaceDialogProps()} />
{/if}
{#if $labelEditDialog !== null}
  <LabelEditDialog {...createLabelEditDialogProps()} />
{/if}
{#if $otherParentsDialog !== null}
  <OtherParentsDialog {...createOtherParentsDialogProps()} />
{/if}
