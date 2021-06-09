import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createLabelEditDialogViewModel,
  LabelEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createItemTreeViewModel,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'

export type RootViewModel = {
  itemTreeViewModel: ItemTreeViewModel
  labelEditDialog: LabelEditDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    itemTreeViewModel: createItemTreeViewModel(state),
    labelEditDialog: createLabelEditDialogViewModel(state),
  }
}
