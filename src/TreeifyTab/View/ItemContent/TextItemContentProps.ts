import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

export type TextItemContentProps = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
  hasCite: boolean
}

export function createTextItemContentProps(itemId: ItemId): TextItemContentProps {
  return {
    itemType: ItemType.TEXT,
    domishObjects: Internal.instance.state.textItems[itemId].domishObjects,
    hasCite: Internal.instance.state.items[itemId].cite !== null,
  }
}
