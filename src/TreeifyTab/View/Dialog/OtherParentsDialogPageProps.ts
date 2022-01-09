import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import {
  createOtherParentsDialogItemProps,
  OtherParentsDialogItemProps,
} from 'src/TreeifyTab/View/Dialog/OtherParentsDialogItemProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type OtherParentsDialogPageProps = {
  pageContentProps: ItemContentProps
  itemPropses: RArray<OtherParentsDialogItemProps>
}

export function createOtherParentsDialogPageProps(
  itemPaths: RArray<ItemPath>
): OtherParentsDialogPageProps {
  return {
    pageContentProps: createItemContentProps(ItemPath.getRootItemId(itemPaths[0])),
    itemPropses: itemPaths.map(createOtherParentsDialogItemProps),
  }
}
