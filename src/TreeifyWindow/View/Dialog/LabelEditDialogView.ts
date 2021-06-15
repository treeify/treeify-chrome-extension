import {LabelEditDialog, State} from 'src/TreeifyWindow/Internal/State'

export type LabelEditDialogViewModel = LabelEditDialog

export function createLabelEditDialogViewModel(state: State): LabelEditDialogViewModel | undefined {
  return state.labelEditDialog ?? undefined
}
