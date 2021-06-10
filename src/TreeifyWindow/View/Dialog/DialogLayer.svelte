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
    return {
      webPageItemTitleSettingDialog: Internal.instance.state.webPageItemTitleSettingDialog,
    }
  }
</script>

<script lang="ts">
  export let webPageItemTitleSettingDialog: Writable<State.WebPageItemTitleSettingDialog | null>

  const defaultWindowModeSettingDialogProps = createDefaultWindowModeSettingDialogProps()
  const codeBlockItemEditDialogProps = createCodeBlockItemEditDialogProps()
  const workspaceDialogProps = createWorkspaceDialogProps()
  const labelEditDialogProps = createLabelEditDialogProps()
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
{#if labelEditDialogProps !== undefined}
  <LabelEditDialog {...labelEditDialogProps} />
{/if}
{#if otherParentsDialogProps !== undefined}
  <OtherParentsDialog {...otherParentsDialogProps} />
{/if}
