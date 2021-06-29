import {LabelEditDialog, State} from 'src/TreeifyWindow/Internal/State'

export type LabelEditDialogProps = LabelEditDialog

export function createLabelEditDialogProps(state: State): LabelEditDialogProps | undefined {
  if (state.dialog?.type !== 'LabelEditDialog') return undefined

  return state.dialog
}
