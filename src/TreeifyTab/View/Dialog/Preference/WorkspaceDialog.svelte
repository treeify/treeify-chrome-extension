<script lang="ts">
  import { WorkspaceId } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Workspace } from 'src/TreeifyTab/Internal/State'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { assert } from 'src/Utility/Debug/assert'
  import { fly } from 'svelte/transition'

  type WorkspaceRow = { id: WorkspaceId } & Pick<Workspace, 'name'>

  let workspaceArray: WorkspaceRow[] = getStateWorkspaceArray()

  function getStateWorkspaceArray(): WorkspaceRow[] {
    return Object.keys(Internal.instance.state.workspaces).map((key) => {
      const workspaceId = Number(key)
      return {
        id: workspaceId,
        ...Internal.instance.state.workspaces[workspaceId],
      }
    })
  }

  function onClickAddButton() {
    const workspaceId = CurrentState.createWorkspace()
    External.instance.setCurrentWorkspaceId(workspaceId)
    workspaceArray = getStateWorkspaceArray()
  }

  const onInput = (event: Event, workspace: WorkspaceRow) => {
    if (event.target instanceof HTMLInputElement) {
      CurrentState.setWorkspaceName(workspace.id, event.target.value)
      workspaceArray = getStateWorkspaceArray()
    }
  }

  const onClickRadioButton = (workspace: WorkspaceRow) => {
    External.instance.setCurrentWorkspaceId(workspace.id)
    workspaceArray = getStateWorkspaceArray()
  }

  const onClickDeleteButton = (workspace: WorkspaceRow) => {
    assert(Object.keys(Internal.instance.state.workspaces).length > 1)

    CurrentState.deleteWorkspace(workspace.id)
    workspaceArray = getStateWorkspaceArray()
  }
</script>

<CommonDialog class="workspace-dialog_root" title="ワークスペース" showCloseButton>
  <div class="workspace-dialog_content" tabindex="0">
    <div class="workspace-dialog_workspace-list">
      {#each workspaceArray as workspace (workspace.id)}
        <div class="workspace-dialog_workspace" transition:fly|local>
          <input
            type="radio"
            name="currentWorkspaceId"
            class="workspace-dialog_radio-button"
            value={workspace.id.toString()}
            checked={workspace.id === External.instance.getCurrentWorkspaceId()}
            on:input={() => onClickRadioButton(workspace)}
          />
          <input
            type="text"
            class="workspace-dialog_workspace-name"
            value={workspace.name}
            on:input={(event) => onInput(event, workspace)}
          />
          {#if workspaceArray.length > 1}
            <div
              class="workspace-dialog_delete-button"
              on:mousedown|preventDefault={() => onClickDeleteButton(workspace)}
            />
          {:else}
            <div class="workspace-dialog_delete-button-space" />
          {/if}
        </div>
      {/each}
    </div>
    <div class="workspace-dialog_add-button-row">
      <div class="workspace-dialog_add-button" on:mousedown|preventDefault={onClickAddButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --workspace-dialog-delete-button-size: 1.5em;
  }

  .workspace-dialog_content {
    padding: 1em;

    max-height: 100%;
    overflow-y: auto;

    // フォーカス時の枠線を非表示
    outline: none;
  }

  .workspace-dialog_workspace-list {
    display: flex;
    flex-direction: column;
    row-gap: 0.3em;
  }

  .workspace-dialog_workspace {
    display: flex;
    align-items: center;
  }

  .workspace-dialog_radio-button {
    margin: 0 0.3em 0 0;
  }

  .workspace-dialog_workspace-name {
    margin-left: 0.2em;
  }

  .workspace-dialog_delete-button {
    @include common.circle(var(--workspace-dialog-delete-button-size));
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);

    &::before {
      content: '';
      @include common.square(1.2em);
      @include common.absolute-center;

      // lch(40.0%, 0.0, 0.0)相当
      @include common.icon(#5e5e5e, url('trash-can.svg'));
    }
  }

  .workspace-dialog_delete-button-space {
    @include common.circle(var(--workspace-dialog-delete-button-size));
  }

  .workspace-dialog_add-button-row {
    @include common.flex-center;

    margin-top: 0.2em;
  }

  .workspace-dialog_add-button {
    @include common.circle(2em);
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);

    &::before {
      content: '';
      @include common.square(1.6em);
      @include common.absolute-center;

      // lch(50.0%, 0.0, 0.0)相当
      @include common.icon(#777777, url('plus.svg'));
    }
  }
</style>
