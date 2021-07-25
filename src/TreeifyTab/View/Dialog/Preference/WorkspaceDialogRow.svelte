<script lang="ts">
  import {doWithErrorCapture} from '../../../errorCapture'
  import {CurrentState} from '../../../Internal/CurrentState'
  import {Rerenderer} from '../../../Rerenderer'
  import {WorkspaceRecord} from './WorkspaceDialogProps'

  export let workspace: WorkspaceRecord

  const onInput = (event: Event) => {
    doWithErrorCapture(() => {
      if (event.target instanceof HTMLInputElement) {
        CurrentState.setWorkspaceName(workspace.id, event.target.value)
      }
    })
  }

  const onClickRadioButton = () => {
    doWithErrorCapture(() => {
      CurrentState.setCurrentWorkspaceId(workspace.id)
      Rerenderer.instance.rerender()
    })
  }

  const onClickDeleteButton = () => {
    doWithErrorCapture(() => {
      CurrentState.deleteWorkspace(workspace.id)
      Rerenderer.instance.rerender()
    })
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

<style global>
  :root {
    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --workspace-dialog-delete-button-size: 1.5em;

    --workspace-dialog-delete-icon-size: 1.2em;
  }

  .workspace-dialog_existing-workspace {
    display: flex;
    align-items: center;

    margin-top: 3px;
  }

  .workspace-dialog_existing-workspace:first-child {
    margin-top: 0;
  }

  input[type='radio'][name='currentWorkspaceId'] {
    margin: 0 3px 0 0;
  }

  .workspace-dialog_delete-button {
    width: var(--workspace-dialog-delete-button-size);
    height: var(--workspace-dialog-delete-button-size);
  }
  .workspace-dialog_delete-button::before {
    content: '';
    width: var(--workspace-dialog-delete-icon-size);
    height: var(--workspace-dialog-delete-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
