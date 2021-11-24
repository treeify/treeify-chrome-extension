<script lang="ts">
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { WorkspaceDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogProps'
  import WorkspaceDialogRow from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogRow.svelte'

  export let props: WorkspaceDialogProps
</script>

<CommonDialog title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    {#each props.workspaces.toArray() as workspace (workspace.id)}
      <WorkspaceDialogRow {workspace} />
    {/each}
    <div>
      <button class="workspace-dialog_add-button" on:click={props.onClickAddButton}
        >新規作成
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .workspace-dialog_content {
    padding: 1em;

    max-height: 100%;
    overflow-y: auto;

    // フォーカス時の枠線を非表示
    outline: none;

    display: flex;
    flex-direction: column;
    row-gap: 0.3em;
  }

  .workspace-dialog_add-button {
    margin-top: 0.5em;
  }
</style>
