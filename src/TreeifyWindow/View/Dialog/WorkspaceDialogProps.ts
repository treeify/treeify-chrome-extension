import {List} from 'immutable'
import {WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State, Workspace} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type WorkspaceRecord = {id: WorkspaceId} & Workspace

export type WorkspaceDialogProps = {
  workspaces: List<WorkspaceRecord>
  onClickAddButton: () => void
}

export function createWorkspaceDialogProps(state: State): WorkspaceDialogProps | undefined {
  if (state.dialog?.type !== 'WorkspaceDialog') return undefined

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
      Rerenderer.instance.rerender()
    },
  }
}
