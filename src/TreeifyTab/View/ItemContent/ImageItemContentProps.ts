import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

export type ImageItemContentProps = {
  itemType: ItemType.IMAGE
  url: string
  width: string
  aspectRatio: string
}

export function createImageItemContentProps(itemId: ItemId): ImageItemContentProps {
  const imageItem = Internal.instance.state.imageItems[itemId]
  const originalSize = imageItem.originalSize

  return {
    itemType: ItemType.IMAGE,
    url: imageItem.url,
    width: imageItem.widthPx !== null ? `${Math.max(20, imageItem.widthPx)}px` : 'auto',
    aspectRatio: originalSize !== null ? `${originalSize.widthPx / originalSize.heightPx}` : 'auto',
  }
}
