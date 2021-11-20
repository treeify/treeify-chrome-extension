import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type ImageItemContentProps = {
  url: string
  width: string
  aspectRatio: string
}

export function createImageItemContentProps(itemId: ItemId): ItemContentProps {
  const imageItem = Internal.instance.state.imageItems[itemId]
  const originalSize = imageItem.originalSize

  return {
    type: 'ImageItemContentProps',
    url: imageItem.url,
    width: imageItem.widthPx !== null ? `${Math.max(20, imageItem.widthPx)}px` : 'auto',
    aspectRatio: originalSize !== null ? `${originalSize.widthPx / originalSize.heightPx}` : 'auto',
  }
}
