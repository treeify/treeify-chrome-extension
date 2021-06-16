import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type TextItemContentProps = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function createTextItemContentProps(itemId: ItemId): TextItemContentProps {
  return {
    itemType: ItemType.TEXT,
    domishObjects: Internal.instance.state.textItems[itemId].domishObjects,
  }
}
