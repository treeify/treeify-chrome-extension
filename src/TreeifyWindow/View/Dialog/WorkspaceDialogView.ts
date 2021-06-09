import {List} from 'immutable'
import {WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State, Workspace} from 'src/TreeifyWindow/Internal/State'

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
