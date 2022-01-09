import { ItemId } from 'src/TreeifyTab/basicType'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type TextItemContentProps = {
  domishObjects: RArray<DomishObject>
  hasSource: boolean
}

export function createTextItemContentProps(itemId: ItemId): ItemContentProps {
  return {
    type: 'TextItemContentProps',
    domishObjects: Internal.instance.state.textItems[itemId].domishObjects,
    hasSource: Internal.instance.state.items[itemId].source !== null,
  }
}
