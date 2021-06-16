import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeCodeBlockContentProps,
  ItemTreeCodeBlockContentProps,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeCodeBlockContentProps'
import {
  createItemTreeImageContentProps,
  ItemTreeImageContentProps,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeImageContentProps'
import {
  createItemTreeWebPageContentProps,
  ItemTreeWebPageContentProps,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeWebPageContentProps'
import {createItemTreeTextContentProps, ItemTreeTextContentProps} from './ItemTreeTextContentProps'

export type ItemTreeContentProps =
  | ItemTreeTextContentProps
  | ItemTreeWebPageContentProps
  | ItemTreeImageContentProps
  | ItemTreeCodeBlockContentProps

export function createItemTreeContentProps(
  state: State,
  itemPath: ItemPath,
  itemType: ItemType
): ItemTreeContentProps {
  // アイテムタイプごとの固有部分を追加して返す
  switch (itemType) {
    case ItemType.TEXT:
      return createItemTreeTextContentProps(state, itemPath)
    case ItemType.WEB_PAGE:
      return createItemTreeWebPageContentProps(state, itemPath)
    case ItemType.IMAGE:
      return createItemTreeImageContentProps(state, itemPath)
    case ItemType.CODE_BLOCK:
      return createItemTreeCodeBlockContentProps(state, itemPath)
    default:
      assertNeverType(itemType)
  }
}

export namespace ItemTreeContentView {
  /** DOM描画後にフォーカスを設定するために用いる */
  export function focusableDomElementId(itemPath: ItemPath): string {
    return `focusable:${JSON.stringify(itemPath)}`
  }
}
