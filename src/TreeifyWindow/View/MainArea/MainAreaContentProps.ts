import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createMainAreaCodeBlockContentProps,
  MainAreaCodeBlockContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaCodeBlockContentProps'
import {
  createMainAreaImageContentProps,
  MainAreaImageContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaImageContentProps'
import {
  createMainAreaTexContentProps,
  MainAreaTexContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaTexContentProps'
import {
  createMainAreaWebPageContentProps,
  MainAreaWebPageContentProps,
} from 'src/TreeifyWindow/View/MainArea/MainAreaWebPageContentProps'
import {createMainAreaTextContentProps, MainAreaTextContentProps} from './MainAreaTextContentProps'

export type MainAreaContentProps =
  | MainAreaTextContentProps
  | MainAreaWebPageContentProps
  | MainAreaImageContentProps
  | MainAreaCodeBlockContentProps
  | MainAreaTexContentProps

export function createMainAreaContentProps(
  state: State,
  itemPath: ItemPath,
  itemType: ItemType
): MainAreaContentProps {
  // アイテムタイプごとの固有部分を追加して返す
  switch (itemType) {
    case ItemType.TEXT:
      return createMainAreaTextContentProps(state, itemPath)
    case ItemType.WEB_PAGE:
      return createMainAreaWebPageContentProps(state, itemPath)
    case ItemType.IMAGE:
      return createMainAreaImageContentProps(state, itemPath)
    case ItemType.CODE_BLOCK:
      return createMainAreaCodeBlockContentProps(state, itemPath)
    case ItemType.TEX:
      return createMainAreaTexContentProps(state, itemPath)
    default:
      assertNeverType(itemType)
  }
}

export namespace MainAreaContentView {
  /** DOM描画後にフォーカスを設定するために用いる */
  export function focusableDomElementId(itemPath: ItemPath): string {
    return `focusable:${JSON.stringify(itemPath)}`
  }
}
