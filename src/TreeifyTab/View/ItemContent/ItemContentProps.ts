import { DiscriminatedUnion, ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import {
  CodeBlockItemContentProps,
  createCodeBlockItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'
import {
  createImageItemContentProps,
  ImageItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ImageItemContentProps'
import {
  createTexItemContentProps,
  TexItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'
import {
  createTextItemContentProps,
  TextItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/TextItemContentProps'
import {
  createWebPageItemContentProps,
  WebPageItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/WebPageItemContentProps'
import { assertNeverType } from 'src/Utility/Debug/assert'

export type ItemContentProps = DiscriminatedUnion<{
  TextItemContentProps: TextItemContentProps
  WebPageItemContentProps: WebPageItemContentProps
  ImageItemContentProps: ImageItemContentProps
  CodeBlockItemContentProps: CodeBlockItemContentProps
  TexItemContentProps: TexItemContentProps
}>

export function createItemContentProps(itemId: ItemId): ItemContentProps {
  const itemType = Internal.instance.state.items[itemId].type
  switch (itemType) {
    case ItemType.TEXT:
      return createTextItemContentProps(itemId)
    case ItemType.WEB_PAGE:
      return createWebPageItemContentProps(itemId)
    case ItemType.IMAGE:
      return createImageItemContentProps(itemId)
    case ItemType.CODE_BLOCK:
      return createCodeBlockItemContentProps(itemId)
    case ItemType.TEX:
      return createTexItemContentProps(itemId)
    default:
      assertNeverType(itemType)
  }
}
