import { State } from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeViewModel,
  ItemTreeViewModel
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'

export type RootViewModel = {
  itemTreeViewModel: ItemTreeViewModel
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    itemTreeViewModel: createItemTreeViewModel(state),
  }
}
