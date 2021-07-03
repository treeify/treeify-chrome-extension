import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

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
