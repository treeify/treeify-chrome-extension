import {List} from 'immutable'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {
  createOtherParentsDialogItemProps,
  OtherParentsDialogItemProps,
} from 'src/TreeifyTab/View/Dialog/OtherParentsDialogItemProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type OtherParentsDialogPageProps = {
  pageContentProps: ItemContentProps
  itemPropses: List<OtherParentsDialogItemProps>
}

export function createOtherParentsDialogPageProps(
  itemPaths: List<ItemPath>
): OtherParentsDialogPageProps {
  return {
    pageContentProps: createItemContentProps(ItemPath.getRootItemId(itemPaths.first())),
    itemPropses: itemPaths.map(createOtherParentsDialogItemProps),
  }
}
