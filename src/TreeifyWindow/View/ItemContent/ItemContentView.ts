import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {
  createTextItemContentViewModel,
  TextItemContentViewModel,
} from 'src/TreeifyWindow/View/ItemContent/TextItemContentView'

export type ItemContentViewModel = TextItemContentViewModel

export function createItemContentViewModel(itemId: ItemId) {
  const itemType = Internal.instance.state.items[itemId].itemType
  switch (itemType) {
    case ItemType.TEXT:
      return createTextItemContentViewModel(itemId)
    case ItemType.WEB_PAGE:
    case ItemType.IMAGE:
    case ItemType.CODE_BLOCK:
      throw new Error('未実装')
    default:
      assertNeverType(itemType)
  }
}
