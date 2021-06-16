import {List} from 'immutable'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/ItemContentView'

export type OtherParentsDialogProps = {
  itemContentPropss: List<ItemContentProps>
}

export function createOtherParentsDialogProps(state: State): OtherParentsDialogProps | undefined {
  if (state.otherParentsDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemIds = CurrentState.getParentItemIds(ItemPath.getItemId(targetItemPath))
  const targetParentItemId = ItemPath.getParentItemId(targetItemPath)
  const itemContentPropss = parentItemIds
    .filter((itemId) => targetParentItemId !== itemId)
    .map(createItemContentProps)
  return {itemContentPropss}
}
