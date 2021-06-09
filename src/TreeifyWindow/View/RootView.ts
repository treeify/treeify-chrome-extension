import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createLabelEditDialogViewModel,
  LabelEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogView'
import {
  createItemTreeViewModel,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'

export type RootViewModel = {
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
  labelEditDialog: LabelEditDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
    labelEditDialog: createLabelEditDialogViewModel(state),
  }
}
