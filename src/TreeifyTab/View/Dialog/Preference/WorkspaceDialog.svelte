<script lang="ts">
  import { List } from 'immutable'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { WorkspaceRecord } from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogProps'
  import WorkspaceDialogRow from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogRow.svelte'
  import { Writable, writable } from 'svelte/store'

  const initialWorkspaces = Object.keys(Internal.instance.state.workspaces).map((key) => {
    const workspaceId = parseInt(key)
    return {
      id: workspaceId,
      ...Internal.instance.state.workspaces[workspaceId],
    }
  })

  const workspaceList: Writable<List<WorkspaceRecord>> = writable(List(initialWorkspaces))

  function onClickAddButton() {
    const workspaceId = CurrentState.createWorkspace()
    CurrentState.setCurrentWorkspaceId(workspaceId)
    $workspaceList = $workspaceList.push({
      id: workspaceId,
      ...Internal.instance.state.workspaces[workspaceId],
    })
  }
</script>

<CommonDialog title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    {#each $workspaceList.toArray() as workspace (workspace.id)}
      <WorkspaceDialogRow {workspace} />
    {/each}
    <div>
      <button class="workspace-dialog_add-button" on:click={onClickAddButton}>新規作成</button>
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
