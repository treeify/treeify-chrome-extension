import {SearchDialog, State} from 'src/TreeifyWindow/Internal/State'

export type SearchDialogProps = SearchDialog

export function createSearchDialogProps(state: State): SearchDialogProps | undefined {
  return state.searchDialog ?? undefined
}
