import {ItemId} from 'src/TreeifyTab/basicType'

export type TabsDialogItemProps = {
  itemId: ItemId
}

export function createTabsDialogItemProps(itemId: ItemId): TabsDialogItemProps {
  return {itemId}
}
