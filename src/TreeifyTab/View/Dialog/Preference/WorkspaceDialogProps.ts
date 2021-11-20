import { List } from 'immutable'
import { WorkspaceId } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { Workspace } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type WorkspaceRecord = { id: WorkspaceId } & Workspace

export type WorkspaceDialogProps = {
  workspaces: List<WorkspaceRecord>
  onClickAddButton: () => void
}

export function createWorkspaceDialogProps(): WorkspaceDialogProps {
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
      CurrentState.setCurrentWorkspaceId(CurrentState.createWorkspace())
      Rerenderer.instance.rerender()
    },
  }
}
