import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type TexItemContentProps = {
  code: string
  caption: string
}

export function createTexItemContentProps(itemId: ItemId): ItemContentProps {
  const texItem = Internal.instance.state.texItems[itemId]
  return {
    type: 'TexItemContentProps',
    code: texItem.code,
    caption: texItem.caption,
  }
}
