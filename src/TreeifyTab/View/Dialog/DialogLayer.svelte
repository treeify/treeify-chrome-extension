<script lang="ts">
  import CitationSettingDialog from './CitationSettingDialog.svelte'
  import {createCitationSettingDialogProps} from './CitationSettingDialogProps'
  import CodeBlockItemEditDialog from './CodeBlockItemEditDialog.svelte'
  import {createCodeBlockItemEditDialogProps} from './CodeBlockItemEditDialogProps'
  import ContextMenuDialog from './ContextMenuDialog.svelte'
  import {createContextMenuDialogProps} from './ContextMenuDialogProps'
  import {DialogLayerProps} from './DialogLayer'
  import OtherParentsDialog from './OtherParentsDialog.svelte'
  import {createOtherParentsDialogProps} from './OtherParentsDialogProps'
  import PreferenceDialog from './PreferenceDialog.svelte'
  import {createPreferenceDialogProps} from './PreferenceDialogProps'
  import SearchDialog from './SearchDialog.svelte'
  import {createSearchDialogProps} from './SearchDialogProps'
  import TexEditDialog from './TexEditDialog.svelte'
  import {createTexEditDialogProps} from './TexEditDialogProps'
  import WebPageItemTitleSettingDialog from './WebPageItemTitleSettingDialog.svelte'
  import {createWebPageItemTitleSettingDialogProps} from './WebPageItemTitleSettingDialogProps'
  import WorkspaceDialog from './WorkspaceDialog.svelte'
  import {createWorkspaceDialogProps} from './WorkspaceDialogProps'

  export let props: DialogLayerProps
</script>

{#if props.dialog?.type === 'CitationSettingDialog'}
  <CitationSettingDialog props={createCitationSettingDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'CodeBlockItemEditDialog'}
  <CodeBlockItemEditDialog props={createCodeBlockItemEditDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'ContextMenuDialog'}
  <ContextMenuDialog props={createContextMenuDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'PreferenceDialog'}
  <PreferenceDialog props={createPreferenceDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'OtherParentsDialog'}
  <OtherParentsDialog props={createOtherParentsDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'SearchDialog'}
  <SearchDialog props={createSearchDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'TexEditDialog'}
  <TexEditDialog props={createTexEditDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'WebPageItemTitleSettingDialog'}
  <WebPageItemTitleSettingDialog props={createWebPageItemTitleSettingDialogProps(props.dialog)} />
{/if}
{#if props.dialog?.type === 'WorkspaceDialog'}
  <WorkspaceDialog props={createWorkspaceDialogProps(props.dialog)} />
{/if}
