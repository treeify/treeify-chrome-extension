import {LabelEditDialog, State} from 'src/TreeifyWindow/Internal/State'

export type LabelEditDialogProps = LabelEditDialog

export function createLabelEditDialogProps(state: State): LabelEditDialogProps | undefined {
  return state.labelEditDialog ?? undefined
}
