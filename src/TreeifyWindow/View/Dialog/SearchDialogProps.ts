import {SearchDialog, State} from 'src/TreeifyWindow/Internal/State'

export type SearchDialogProps = SearchDialog

export function createSearchDialogProps(state: State): SearchDialogProps | undefined {
  if (state.dialog?.type !== 'SearchDialog') return undefined

  return state.dialog
}
