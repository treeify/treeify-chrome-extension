import {List} from 'immutable'
import {WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State, Workspace} from 'src/TreeifyWindow/Internal/State'
import {
  createButtonElement,
  createDivElement,
  createInputElement,
} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

type WorkspaceRecord = {id: WorkspaceId} & Workspace

export type WorkspaceDialogViewModel = {
  workspaces: List<WorkspaceRecord>
  onClickAddButton: () => void
}

export function createWorkspaceDialogViewModel(state: State): WorkspaceDialogViewModel | undefined {
  if (state.workspaceDialog === null) return undefined

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
      CurrentState.commit()
    },
  }
}

export function WorkspaceDialogView(viewModel: WorkspaceDialogViewModel) {
  const closeDialog = () => {
    CurrentState.setWorkspaceDialog(null)
    CurrentState.commit()
  }

  return CommonDialogView({
    title: 'ワークスペース',
    content: createDivElement(
      {class: 'workspace-dialog_content', tabindex: '0'},
      {},
      viewModel.workspaces
        .map(createWorkspaceRow)
        .push(
          createDivElement('workspace-dialog_add-button', {click: viewModel.onClickAddButton}),
          createButtonElement('workspace-dialog_close-button', {click: closeDialog}, '閉じる')
        )
    ),
    onCloseDialog: closeDialog,
  })
}

function createWorkspaceRow(workspace: WorkspaceRecord) {
  const onInput = (event: InputEvent) => {
    if (event.target instanceof HTMLInputElement) {
      CurrentState.setWorkspaceName(workspace.id, event.target.value)
    }
  }

  const onClickRadioButton = () => {
    CurrentState.setCurrentWorkspaceId(workspace.id)
    CurrentState.commit()
  }

  const onClickDeleteButton = () => {
    CurrentState.deleteWorkspace(workspace.id)
    CurrentState.commit()
  }

  return createDivElement('workspace-dialog_existing-workspace', {}, [
    workspace.id === CurrentState.getCurrentWorkspaceId()
      ? createInputElement(
          {type: 'radio', name: 'currentWorkspaceId', value: workspace.id.toString(), checked: ''},
          {input: onClickRadioButton}
        )
      : createInputElement(
          {type: 'radio', name: 'currentWorkspaceId', value: workspace.id.toString()},
          {input: onClickRadioButton}
        ),
    createInputElement(
      {type: 'text', class: 'workspace-dialog_name', value: workspace.name},
      {input: onInput}
    ),
    createDivElement('workspace-dialog_delete-button', {click: onClickDeleteButton}),
  ])
}

export const WorkspaceDialogCss = css`
  :root {
    /* 作成ボタンのサイズ（正方形の一辺の長さ） */
    --workspace-dialog-add-button-size: 22px;

    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --workspace-dialog-delete-button-size: 19px;
  }

  .workspace-dialog_content {
    padding: 1em;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .workspace-dialog_existing-workspace {
    display: flex;
    align-items: center;

    margin-top: 3px;

    font-size: 100%;
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

    background: hsl(0, 0%, 40%);
    -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
    -webkit-mask-size: contain;

    cursor: pointer;
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
`
