import {List} from 'immutable'
import {OtherParentsDialog} from 'src/TreeifyTab/External/DialogState'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

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
