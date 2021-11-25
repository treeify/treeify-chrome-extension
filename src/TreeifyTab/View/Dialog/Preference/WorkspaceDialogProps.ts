import { WorkspaceId } from 'src/TreeifyTab/basicType'
import { Workspace } from 'src/TreeifyTab/Internal/State'

export type WorkspaceRecord = { id: WorkspaceId } & Workspace

export type WorkspaceDialogProps = {}

export function createWorkspaceDialogProps(): WorkspaceDialogProps {
  return {}
}
