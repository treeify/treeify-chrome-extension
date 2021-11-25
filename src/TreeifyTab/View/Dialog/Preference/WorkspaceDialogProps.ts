import { WorkspaceId } from 'src/TreeifyTab/basicType'
import { Workspace } from 'src/TreeifyTab/Internal/State'

export type WorkspaceRow = { id: WorkspaceId } & Pick<Workspace, 'name'>

export type WorkspaceDialogProps = {}

export function createWorkspaceDialogProps(): WorkspaceDialogProps {
  return {}
}
