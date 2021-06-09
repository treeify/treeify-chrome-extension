import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createLabelEditDialogViewModel,
  LabelEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {
  createOtherParentsDialogViewModel,
  OtherParentsDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogView'
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
  otherParentsDialog: OtherParentsDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
    labelEditDialog: createLabelEditDialogViewModel(state),
    otherParentsDialog: createOtherParentsDialogViewModel(state),
  }
}
