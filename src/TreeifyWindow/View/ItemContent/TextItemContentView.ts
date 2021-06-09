import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {get} from 'svelte/store'

export type TextItemContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function createTextItemContentViewModel(itemId: ItemId): TextItemContentViewModel {
  return {
    itemType: ItemType.TEXT,
    domishObjects: get(Internal.instance.state.textItems[itemId].domishObjects),
  }
}
