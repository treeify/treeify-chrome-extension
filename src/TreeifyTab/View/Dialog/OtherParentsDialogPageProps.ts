import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import {
  createOtherParentsDialogItemProps,
  OtherParentsDialogItemProps,
} from 'src/TreeifyTab/View/Dialog/OtherParentsDialogItemProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { Rist } from 'src/Utility/fp-ts'

export type OtherParentsDialogPageProps = {
  pageContentProps: ItemContentProps
  itemPropses: Rist.T<OtherParentsDialogItemProps>
}

export function createOtherParentsDialogPageProps(
  itemPaths: Rist.T<ItemPath>
): OtherParentsDialogPageProps {
  return {
    pageContentProps: createItemContentProps(ItemPath.getRootItemId(itemPaths[0])),
    itemPropses: itemPaths.map(createOtherParentsDialogItemProps),
  }
}
