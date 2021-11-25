<script lang="ts">
  import { List } from 'immutable'
  import { WorkspaceId } from 'src/TreeifyTab/basicType'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Workspace } from 'src/TreeifyTab/Internal/State'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { Writable, writable } from 'svelte/store'
  import { fly } from 'svelte/transition'

  type WorkspaceRow = { id: WorkspaceId } & Pick<Workspace, 'name'>

  const workspaceList: Writable<List<WorkspaceRow>> = writable(List())
  reflectStateToView()

  function reflectStateToView() {
    const workspaces = Object.keys(Internal.instance.state.workspaces).map((key) => {
      const workspaceId = parseInt(key)
      return {
        id: workspaceId,
        ...Internal.instance.state.workspaces[workspaceId],
      }
    })
    $workspaceList = List(workspaces)
  }

  function onClickAddButton() {
    const workspaceId = CurrentState.createWorkspace()
    CurrentState.setCurrentWorkspaceId(workspaceId)
    reflectStateToView()
  }

  const onInput = (event: Event, workspace: WorkspaceRow) => {
    if (event.target instanceof HTMLInputElement) {
      CurrentState.setWorkspaceName(workspace.id, event.target.value)
      reflectStateToView()
    }
  }

  const onClickRadioButton = (workspace: WorkspaceRow) => {
    CurrentState.setCurrentWorkspaceId(workspace.id)
    reflectStateToView()
  }

  const onClickDeleteButton = (workspace: WorkspaceRow) => {
    if (Object.keys(Internal.instance.state.workspaces).length === 1) {
      alert('ワークスペースを0個にはできません')
    } else {
      CurrentState.deleteWorkspace(workspace.id)
      reflectStateToView()
    }
  }
</script>

<CommonDialog title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    {#each $workspaceList.toArray() as workspace (workspace.id)}
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
    width: 1.5em;
    aspect-ratio: 1;

    &::before {
      content: '';
      width: 1.2em;
      aspect-ratio: 1;

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      // lch(40.0%, 0.0, 0.0)相当
      background: #5e5e5e;
      -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
      -webkit-mask-size: contain;
    }
  }

  .workspace-dialog_add-button {
    margin-top: 0.5em;
  }
</style>
