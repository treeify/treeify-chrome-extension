import {List} from 'immutable'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createButtonElement, createDivElement} from 'src/TreeifyWindow/View/createElement'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'
import {
  createItemContentViewModel,
  ItemContentView,
  ItemContentViewModel,
} from 'src/TreeifyWindow/View/ItemContent/ItemContentView'

export type OtherParentsDialogViewModel = {
  itemContentViewModels: List<ItemContentViewModel>
}

export function createOtherParentsDialogViewModel(
  state: State
): OtherParentsDialogViewModel | undefined {
  if (state.otherParentsDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemIds = CurrentState.getParentItemIds(ItemPath.getItemId(targetItemPath))
  const targetParentItemId = ItemPath.getParentItemId(targetItemPath)
  const itemContentViewModels = parentItemIds
    .filter((itemId) => targetParentItemId !== itemId)
    .map(createItemContentViewModel)
  return {itemContentViewModels}
}

export function OtherParentsDialogView(viewModel: OtherParentsDialogViewModel) {
  const closeDialog = () => {
    doWithErrorCapture(() => {
      CurrentState.setOtherParentsDialog(null)
      CurrentState.commit()
    })
  }

  return CommonDialogView({
    title: '他のトランスクルード元',
    content: createDivElement('other-parents-dialog_content', {}, [
      createDivElement(
        'other-parents-dialog_item-content-list',
        {},
        viewModel.itemContentViewModels.map((itemContentViewModel) =>
          createDivElement('other-parents-dialog_row-wrapper', {}, [
            ItemContentView(itemContentViewModel),
          ])
        )
      ),
      createButtonElement('other-parents-dialog_close-button', {click: closeDialog}, '閉じる'),
    ]),
    onCloseDialog: closeDialog,
  })
}
