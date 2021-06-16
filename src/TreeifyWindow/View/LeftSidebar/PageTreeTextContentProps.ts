import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'

export type PageTreeTextContentProps = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}
