<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { WorkspaceRecord } from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogProps'

  export let workspace: WorkspaceRecord

  const onInput = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      CurrentState.setWorkspaceName(workspace.id, event.target.value)
    }
  }

  const onClickRadioButton = () => {
    CurrentState.setCurrentWorkspaceId(workspace.id)
    Rerenderer.instance.rerender()
  }

  const onClickDeleteButton = () => {
    if (Object.keys(Internal.instance.state.workspaces).length === 1) {
      alert('ワークスペースを0個にはできません')
    } else {
      CurrentState.deleteWorkspace(workspace.id)
      Rerenderer.instance.rerender()
    }
  }
</script>

<div class="workspace-dialog_existing-workspace">
  <input
    type="radio"
    name="currentWorkspaceId"
    value={workspace.id.toString()}
    checked={workspace.id === CurrentState.getCurrentWorkspaceId()}
    on:input={onClickRadioButton}
  />
  <input type="text" class="workspace-dialog_name" value={workspace.name} on:input={onInput} />
  <div class="workspace-dialog_delete-button icon-button" on:click={onClickDeleteButton} />
</div>

<style global lang="scss">
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
</style>
