import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {
  CodeBlockItemContentProps,
  createCodeBlockItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/CodeBlocktemContentProps'
import {
  createImageItemContentProps,
  ImageItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/ImageItemContentProps'
import {
  createTextItemContentProps,
  TextItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/TextItemContentProps'
import {
  createWebPageItemContentProps,
  WebPageItemContentProps,
} from 'src/TreeifyWindow/View/ItemContent/WebPageItemContentProps'

export type ItemContentProps =
  | TextItemContentProps
  | WebPageItemContentProps
  | ImageItemContentProps
  | CodeBlockItemContentProps

export function createItemContentProps(itemId: ItemId) {
  const itemType = Internal.instance.state.items[itemId].itemType
  switch (itemType) {
    case ItemType.TEXT:
      return createTextItemContentProps(itemId)
    case ItemType.WEB_PAGE:
      return createWebPageItemContentProps(itemId)
    case ItemType.IMAGE:
      return createImageItemContentProps(itemId)
    case ItemType.CODE_BLOCK:
      return createCodeBlockItemContentProps(itemId)
    default:
      assertNeverType(itemType)
  }
}
