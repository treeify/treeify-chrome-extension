import {List} from 'immutable'
import {WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {Workspace, WorkspaceDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type WorkspaceRecord = {id: WorkspaceId} & Workspace

export type WorkspaceDialogProps = {
  workspaces: List<WorkspaceRecord>
  onClickAddButton: () => void
}

export function createWorkspaceDialogProps(dialog: WorkspaceDialog): WorkspaceDialogProps {
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
      Rerenderer.instance.rerender()
    },
  }
}
