import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CiteProps, createCiteProps } from 'src/TreeifyTab/View/CiteProps'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type TexItemContentProps = {
  code: string
  caption: string
  citeProps: CiteProps | undefined
}

export function createTexItemContentProps(itemId: ItemId): ItemContentProps {
  const texItem = Internal.instance.state.texItems[itemId]
  return {
    type: 'TexItemContentProps',
    code: texItem.code,
    caption: texItem.caption,
    citeProps: createCiteProps(itemId),
  }
}
