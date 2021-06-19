import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type ImageItemContentProps = {
  itemType: ItemType.IMAGE
  url: string
}

export function createImageItemContentProps(itemId: ItemId): ImageItemContentProps {
  return {
    itemType: ItemType.IMAGE,
    url: Internal.instance.state.imageItems[itemId].url,
  }
}
