<script lang="ts">
  import CommonDialog from '../CommonDialog.svelte'
  import {WorkspaceDialogProps} from './WorkspaceDialogProps'
  import WorkspaceDialogRow from './WorkspaceDialogRow.svelte'

  export let props: WorkspaceDialogProps
</script>

<CommonDialog title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    {#each props.workspaces.toArray() as workspace}
      <WorkspaceDialogRow {workspace} />
    {/each}
    <button class="workspace-dialog_add-button" on:click={props.onClickAddButton}>新規作成</button>
  </div>
</CommonDialog>

<style global>
  .workspace-dialog_content {
    padding: 1em;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .workspace-dialog_add-button {
    margin-top: 5px;
  }
</style>
