<script lang="ts">
  import { WorkspaceId } from 'src/TreeifyTab/basicType'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Workspace } from 'src/TreeifyTab/Internal/State'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { fly } from 'svelte/transition'

  type WorkspaceRow = { id: WorkspaceId } & Pick<Workspace, 'name'>

  let workspaceArray: WorkspaceRow[] = getStateWorkspaceArray()

  function getStateWorkspaceArray(): WorkspaceRow[] {
    return Object.keys(Internal.instance.state.workspaces).map((key) => {
      const workspaceId = parseInt(key)
      return {
        id: workspaceId,
        ...Internal.instance.state.workspaces[workspaceId],
      }
    })
  }

  function onClickAddButton() {
    const workspaceId = CurrentState.createWorkspace()
    CurrentState.setCurrentWorkspaceId(workspaceId)
    workspaceArray = getStateWorkspaceArray()
  }

  const onInput = (event: Event, workspace: WorkspaceRow) => {
    if (event.target instanceof HTMLInputElement) {
      CurrentState.setWorkspaceName(workspace.id, event.target.value)
      workspaceArray = getStateWorkspaceArray()
    }
  }

  const onClickRadioButton = (workspace: WorkspaceRow) => {
    CurrentState.setCurrentWorkspaceId(workspace.id)
    workspaceArray = getStateWorkspaceArray()
  }

  const onClickDeleteButton = (workspace: WorkspaceRow) => {
    if (Object.keys(Internal.instance.state.workspaces).length === 1) {
      alert('ワークスペースを0個にはできません')
    } else {
      CurrentState.deleteWorkspace(workspace.id)
      workspaceArray = getStateWorkspaceArray()
    }
  }
</script>

<CommonDialog title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    {#each workspaceArray as workspace (workspace.id)}
      <div class="workspace-dialog_existing-workspace" transition:fly|local>
        <input
          type="radio"
          name="currentWorkspaceId"
          value={workspace.id.toString()}
          checked={workspace.id === CurrentState.getCurrentWorkspaceId()}
          on:input={() => onClickRadioButton(workspace)}
        />
        <input
          type="text"
          class="workspace-dialog_name"
          value={workspace.name}
          on:input={(event) => onInput(event, workspace)}
        />
        <div
          class="workspace-dialog_delete-button icon-button"
          on:click={() => onClickDeleteButton(workspace)}
        />
      </div>
    {/each}
    <div>
      <button class="workspace-dialog_add-button" on:click={onClickAddButton}>新規作成</button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

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

  .workspace-dialog_existing-workspace {
    display: flex;
    align-items: center;

    input[type='radio'][name='currentWorkspaceId'] {
      margin: 0;
    }
  }

  .workspace-dialog_name {
    margin-left: 0.2em;
  }

  .workspace-dialog_delete-button {
    @include common.square(1.5em);

    &::before {
      content: '';
      @include common.square(1.2em);
      @include common.absolute-center;

      // lch(40.0%, 0.0, 0.0)相当
      @include common.icon(#5e5e5e, url('./trash-can-icon.svg'));
    }
  }

  .workspace-dialog_add-button {
    margin-top: 0.5em;
  }
</style>
