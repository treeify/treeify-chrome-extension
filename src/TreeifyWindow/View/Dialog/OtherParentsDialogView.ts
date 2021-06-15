import {List} from 'immutable'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemContentViewModel,
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
