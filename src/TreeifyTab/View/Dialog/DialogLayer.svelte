<script lang="ts">
  import CaptionSettingDialog from 'src/TreeifyTab/View/Dialog/CaptionSettingDialog.svelte'
  import CodeBlockItemEditDialog from 'src/TreeifyTab/View/Dialog/CodeBlockItemEditDialog.svelte'
  import CodeBlockLanguageSettingDialog from 'src/TreeifyTab/View/Dialog/CodeBlockLanguageSettingDialog.svelte'
  import CommandPalette from 'src/TreeifyTab/View/Dialog/CommandPalette.svelte'
  import ContextMenu from 'src/TreeifyTab/View/Dialog/ContextMenu.svelte'
  import { DialogLayerProps } from 'src/TreeifyTab/View/Dialog/DialogLayerProps'
  import ExportDialog from 'src/TreeifyTab/View/Dialog/ExportDialog.svelte'
  import ImageItemEditDialog from 'src/TreeifyTab/View/Dialog/ImageItemEditDialog.svelte'
  import ItemAdditionDropdownMenuDialog from 'src/TreeifyTab/View/Dialog/ItemAdditionDropdownMenuDialog.svelte'
  import OtherParentsDialog from 'src/TreeifyTab/View/Dialog/OtherParentsDialog.svelte'
  import OtherSettingsDialog from 'src/TreeifyTab/View/Dialog/OtherSettingsDialog.svelte'
  import CustomCssDialog from 'src/TreeifyTab/View/Dialog/Preference/CustomCssDialog.svelte'
  import KeyBindingDialog from 'src/TreeifyTab/View/Dialog/Preference/KeyBindingDialog.svelte'
  import PreferenceDropdownMenuDialog from 'src/TreeifyTab/View/Dialog/Preference/PreferenceDropdownMenuDialog.svelte'
  import WorkspaceDialog from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialog.svelte'
  import ReplaceDialog from 'src/TreeifyTab/View/Dialog/ReplaceDialog.svelte'
  import { createReplaceDialogProps } from 'src/TreeifyTab/View/Dialog/ReplaceDialogProps'
  import SearchDialog from 'src/TreeifyTab/View/Dialog/SearchDialog.svelte'
  import { createSearchDialogProps } from 'src/TreeifyTab/View/Dialog/SearchDialogProps'
  import SourceEditDialog from 'src/TreeifyTab/View/Dialog/SourceEditDialog.svelte'
  import TabsDialog from 'src/TreeifyTab/View/Dialog/TabsDialog.svelte'
  import TexItemEditDialog from 'src/TreeifyTab/View/Dialog/TexItemEditDialog.svelte'
  import WebPageItemTitleSettingDialog from 'src/TreeifyTab/View/Dialog/WebPageItemTitleSettingDialog.svelte'

  export let props: DialogLayerProps
</script>

{#if props.dialogState === undefined}
  <!-- ダイアログなし -->
{:else if props.dialogState.type === 'CaptionSettingDialog'}
  <CaptionSettingDialog />
{:else if props.dialogState.type === 'SourceEditDialog'}
  <SourceEditDialog />
{:else if props.dialogState.type === 'CodeBlockItemEditDialog'}
  <CodeBlockItemEditDialog />
{:else if props.dialogState.type === 'CodeBlockLanguageSettingDialog'}
  <CodeBlockLanguageSettingDialog />
{:else if props.dialogState.type === 'CommandPalette'}
  <CommandPalette />
{:else if props.dialogState.type === 'ContextMenu'}
  <ContextMenu dialog={props.dialogState} />
{:else if props.dialogState.type === 'CustomCssDialog'}
  <CustomCssDialog />
{:else if props.dialogState.type === 'ExportDialog'}
  <ExportDialog />
{:else if props.dialogState.type === 'ImageItemEditDialog'}
  <ImageItemEditDialog />
{:else if props.dialogState.type === 'ItemAdditionDropdownMenuDialog'}
  <ItemAdditionDropdownMenuDialog />
{:else if props.dialogState.type === 'KeyBindingDialog'}
  <KeyBindingDialog />
{:else if props.dialogState.type === 'OtherParentsDialog'}
  <OtherParentsDialog />
{:else if props.dialogState.type === 'OtherSettingsDialog'}
  <OtherSettingsDialog />
{:else if props.dialogState.type === 'PreferenceDropdownMenuDialog'}
  <PreferenceDropdownMenuDialog />
{:else if props.dialogState.type === 'SearchDialog'}
  <SearchDialog props={createSearchDialogProps()} />
{:else if props.dialogState.type === 'TabsDialog'}
  <TabsDialog dialog={props.dialogState} />
{:else if props.dialogState.type === 'TexItemEditDialog'}
  <TexItemEditDialog />
{:else if props.dialogState.type === 'ReplaceDialog'}
  <ReplaceDialog props={createReplaceDialogProps()} />
{:else if props.dialogState.type === 'WebPageItemTitleSettingDialog'}
  <WebPageItemTitleSettingDialog />
{:else if props.dialogState.type === 'WorkspaceDialog'}
  <WorkspaceDialog />
{/if}
