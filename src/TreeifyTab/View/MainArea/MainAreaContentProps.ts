import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {
  createMainAreaCodeBlockContentProps,
  MainAreaCodeBlockContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaCodeBlockContentProps'
import {
  createMainAreaImageContentProps,
  MainAreaImageContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaImageContentProps'
import {
  createMainAreaTableContentProps,
  MainAreaTableContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaTableContentProps'
import {
  createMainAreaTexContentProps,
  MainAreaTexContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaTexContentProps'
import {
  createMainAreaWebPageContentProps,
  MainAreaWebPageContentProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaWebPageContentProps'
import {createMainAreaTextContentProps, MainAreaTextContentProps} from './MainAreaTextContentProps'

export type MainAreaContentProps =
  | MainAreaTextContentProps
  | MainAreaWebPageContentProps
  | MainAreaImageContentProps
  | MainAreaCodeBlockContentProps
  | MainAreaTexContentProps
  | MainAreaTableContentProps

export function createMainAreaContentProps(
  state: State,
  itemPath: ItemPath,
  itemType: ItemType
): MainAreaContentProps {
  // テーブル表示する条件判定
  if (
    state.items[ItemPath.getItemId(itemPath)].view.type === 'table' &&
    CurrentState.getDisplayingChildItemIds(itemPath).size === 0
  ) {
    return createMainAreaTableContentProps(state, itemPath)
  }

  // 項目タイプごとの固有部分を追加して返す
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
