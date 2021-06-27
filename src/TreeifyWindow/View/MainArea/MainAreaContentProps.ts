import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeCodeBlockContentProps,
  MainAreaCodeBlockContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaCodeBlockContentProps'
import {
  createItemTreeImageContentProps,
  MainAreaImageContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaImageContentProps'
import {
  createItemTreeTexContentProps,
  MainAreaTexContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaTexContentProps'
import {
  createItemTreeWebPageContentProps,
  MainAreaWebPageContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaWebPageContentProps'
import {createItemTreeTextContentProps, MainAreaTextContentProps} from './MainAreaTextContentProps'

export type MainAreaContentProps =
  | MainAreaTextContentProps
  | MainAreaWebPageContentProps
  | MainAreaImageContentProps
  | MainAreaCodeBlockContentProps
  | MainAreaTexContentProps

export function createItemTreeContentProps(
  state: State,
  itemPath: ItemPath,
  itemType: ItemType
): MainAreaContentProps {
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
    case ItemType.TEX:
      return createItemTreeTexContentProps(state, itemPath)
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
