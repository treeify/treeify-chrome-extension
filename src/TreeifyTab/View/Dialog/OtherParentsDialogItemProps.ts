import {ItemId} from 'src/TreeifyTab/basicType'

export type OtherParentsDialogItemProps = {
  itemId: ItemId
}

export function createOtherParentsDialogItemProps(itemId: ItemId): OtherParentsDialogItemProps {
  return {itemId}
}
