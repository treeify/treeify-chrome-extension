import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type ImageItemContentProps = {
  url: string
  width: string
  aspectRatio: string
  caption: string
  cssClasses: RArray<string>
}

export function createImageItemContentProps(itemId: ItemId): ItemContentProps {
  const imageItem = Internal.instance.state.imageItems[itemId]
  const originalSize = imageItem.originalSize
  const widthPx = imageItem.widthPx ?? originalSize?.widthPx

  return {
    type: 'ImageItemContentProps',
    url: imageItem.url,
    width: widthPx !== undefined ? `${widthPx}px` : 'auto',
    aspectRatio: originalSize !== null ? `${originalSize.widthPx / originalSize.heightPx}` : 'auto',
    caption: imageItem.caption,
    cssClasses: Internal.instance.state.items[itemId].cssClasses,
  }
}
