import {List} from 'immutable'
import {WorkspaceId} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State, Workspace} from 'src/TreeifyWindow/Internal/State'
import {
  createButtonElement,
  createDivElement,
  createInputElement,
} from 'src/TreeifyWindow/View/createElement'
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
    doWithErrorCapture(() => {
      CurrentState.setWorkspaceDialog(null)
      CurrentState.commit()
    })
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
    doWithErrorCapture(() => {
      if (event.target instanceof HTMLInputElement) {
        CurrentState.setWorkspaceName(workspace.id, event.target.value)
      }
    })
  }

  const onClickRadioButton = () => {
    doWithErrorCapture(() => {
      CurrentState.setCurrentWorkspaceId(workspace.id)
      CurrentState.commit()
    })
  }

  const onClickDeleteButton = () => {
    doWithErrorCapture(() => {
      CurrentState.deleteWorkspace(workspace.id)
      CurrentState.commit()
    })
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
