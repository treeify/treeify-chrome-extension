import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CiteProps, createCiteProps } from 'src/TreeifyTab/View/CiteProps'

export type TexItemContentProps = {
  itemType: ItemType.TEX
  code: string
  caption: string
  citeProps: CiteProps | undefined
}

export function createTexItemContentProps(itemId: ItemId): TexItemContentProps {
  const texItem = Internal.instance.state.texItems[itemId]
  return {
    itemType: ItemType.TEX,
    code: texItem.code,
    caption: texItem.caption,
    citeProps: createCiteProps(itemId),
  }
}
