<script context="module" lang="ts">
  import {List} from 'immutable'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from '../../Internal/Internal'

  export function createWorkspaceDialogProps() {
    const state = Internal.instance.state

    const workspaces = []
    for (const key in state.workspaces) {
      const workspaceId = parseInt(key)
      workspaces.push({
        id: workspaceId,
        ...state.workspaces[workspaceId],
      })
    }
    return {
      workspaces: List(workspaces),
      onClickAddButton: () => {
        CurrentState.createWorkspace()
        // CurrentState.commit()
      },
    }
  }
</script>

<script lang="ts">
  import {WorkspaceId} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {State} from '../../Internal/State'
  import CommonDialog from './CommonDialog.svelte'
  import WorkspaceDialogRow from './WorkspaceDialogRow.svelte'

  type WorkspaceRecord = {id: WorkspaceId} & State.Workspace

  export let workspaces: List<WorkspaceRecord>
  export let onClickAddButton: () => void

  const closeDialog = () => {
    doWithErrorCapture(() => {
      CurrentState.setWorkspaceDialog(null)
      // CurrentState.commit()
    })
  }
</script>

<CommonDialog title="ワークスペース" onCloseDialog={closeDialog}>
  <div class="workspace-dialog_content" tabindex="0" />
  {#each workspaces.toArray() as workspace}
    <WorkspaceDialogRow {workspace} />
  {/each}
  <div class="workspace-dialog_add-button" on:click={onClickAddButton} />
  <button class="workspace-dialog_close-button" on:click={closeDialog}>閉じる</button>
</CommonDialog>

<style>
  :root {
    /* 作成ボタンのサイズ（正方形の一辺の長さ） */
    --workspace-dialog-add-button-size: 22px;
  }

  .workspace-dialog_content {
    padding: 1em;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .workspace-dialog_add-button {
    width: var(--workspace-dialog-add-button-size);
    height: var(--workspace-dialog-add-button-size);

    margin: 3px auto;

    background: hsl(0, 0%, 35%);
    -webkit-mask: url('./plus-icon.svg') no-repeat center;
    -webkit-mask-size: contain;

    cursor: pointer;
  }

  .workspace-dialog_close-button {
    /* 右寄せにする */
    display: block;
    margin-left: auto;

    margin-top: 1em;
  }
</style>
