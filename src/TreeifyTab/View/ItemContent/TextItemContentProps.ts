import { List } from 'immutable'
import { ItemId } from 'src/TreeifyTab/basicType'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type TextItemContentProps = {
  domishObjects: List<DomishObject>
  hasCite: boolean
}

export function createTextItemContentProps(itemId: ItemId): ItemContentProps {
  return {
    type: 'TextItemContentProps',
    domishObjects: Internal.instance.state.textItems[itemId].domishObjects,
    hasCite: Internal.instance.state.items[itemId].cite !== null,
  }
}
