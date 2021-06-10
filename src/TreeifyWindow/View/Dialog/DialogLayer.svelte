<script context="module" lang="ts">
  import {Writable} from 'svelte/store'
  import {Internal} from '../../Internal/Internal'
  import {State} from '../../Internal/State'
  import CodeBlockItemEditDialog, {
    createCodeBlockItemEditDialogProps,
  } from './CodeBlockItemEditDialog.svelte'
  import DefaultWindowModeSettingDialog, {
    createDefaultWindowModeSettingDialogProps,
  } from './DefaultWindowModeSettingDialog.svelte'
  import LabelEditDialog, {createLabelEditDialogProps} from './LabelEditDialog.svelte'
  import OtherParentsDialog, {createOtherParentsDialogProps} from './OtherParentsDialog.svelte'
  import WebPageItemTitleSettingDialog, {
    createWebPageItemTitleSettingDialogProps,
  } from './WebPageItemTitleSettingDialog.svelte'
  import WorkspaceDialog, {createWorkspaceDialogProps} from './WorkspaceDialog.svelte'

  export function createDialogLayerProps() {
    const state = Internal.instance.state
    return {
      webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
      labelEditDialog: state.labelEditDialog,
    }
  }
</script>

<script lang="ts">
  export let webPageItemTitleSettingDialog: Writable<State.WebPageItemTitleSettingDialog | null>
  export let labelEditDialog: Writable<State.LabelEditDialog | null>

  const defaultWindowModeSettingDialogProps = createDefaultWindowModeSettingDialogProps()
  const codeBlockItemEditDialogProps = createCodeBlockItemEditDialogProps()
  const workspaceDialogProps = createWorkspaceDialogProps()
  const otherParentsDialogProps = createOtherParentsDialogProps()
</script>

{#if $webPageItemTitleSettingDialog !== null}
  <WebPageItemTitleSettingDialog
    {...createWebPageItemTitleSettingDialogProps($webPageItemTitleSettingDialog)}
  />
{/if}
{#if codeBlockItemEditDialogProps !== undefined}
  <CodeBlockItemEditDialog {...codeBlockItemEditDialogProps} />
{/if}
{#if defaultWindowModeSettingDialogProps !== undefined}
  <DefaultWindowModeSettingDialog {...defaultWindowModeSettingDialogProps} />
{/if}
{#if workspaceDialogProps !== undefined}
  <WorkspaceDialog {...workspaceDialogProps} />
{/if}
{#if $labelEditDialog !== null}
  <LabelEditDialog {...createLabelEditDialogProps()} />
{/if}
{#if otherParentsDialogProps !== undefined}
  <OtherParentsDialog {...otherParentsDialogProps} />
{/if}
