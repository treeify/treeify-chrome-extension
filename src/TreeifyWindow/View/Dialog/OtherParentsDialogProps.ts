import {List} from 'immutable'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {OtherParentsDialog} from 'src/TreeifyWindow/Internal/State'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/ItemContentProps'

export type OtherParentsDialogProps = {
  itemContentPropses: List<ItemContentProps>
}

export function createOtherParentsDialogProps(dialog: OtherParentsDialog): OtherParentsDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemIds = CurrentState.getParentItemIds(ItemPath.getItemId(targetItemPath))
  const targetParentItemId = ItemPath.getParentItemId(targetItemPath)
  const itemContentPropses = parentItemIds
    .filter((itemId) => targetParentItemId !== itemId)
    .map(createItemContentProps)
  return {itemContentPropses}
}
