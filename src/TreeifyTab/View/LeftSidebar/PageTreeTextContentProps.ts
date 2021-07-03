import {List} from 'immutable'
import {ItemType} from 'src/TreeifyTab/basicType'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'

export type PageTreeTextContentProps = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}
