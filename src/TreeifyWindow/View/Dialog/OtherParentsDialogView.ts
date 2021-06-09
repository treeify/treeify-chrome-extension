import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'

export type OtherParentsDialogViewModel = {
  itemIds: List<ItemId>
}

export function createOtherParentsDialogViewModel(
  state: State
): OtherParentsDialogViewModel | undefined {
  if (state.otherParentsDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemIds = CurrentState.getParentItemIds(ItemPath.getItemId(targetItemPath))
  const targetParentItemId = ItemPath.getParentItemId(targetItemPath)
  const itemIds = parentItemIds.filter((itemId) => targetParentItemId !== itemId)
  return {itemIds}
}
