import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {
  createTextItemContentProps,
  TextItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/TextItemContentProps'

export type ItemContentProps = TextItemContentProps

export function createItemContentProps(itemId: ItemId) {
  const itemType = Internal.instance.state.items[itemId].itemType
  switch (itemType) {
    case ItemType.TEXT:
      return createTextItemContentProps(itemId)
    case ItemType.WEB_PAGE:
    case ItemType.IMAGE:
    case ItemType.CODE_BLOCK:
      throw new Error('未実装')
    default:
      assertNeverType(itemType)
  }
}
