import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {PageTreeTextContentProps} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeTextContentView'
import {PageTreeWebPageContentProps} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeWebPageContentView'

export type PageTreeContentProps = PageTreeTextContentProps | PageTreeWebPageContentProps

export function createPageTreeContentProps(state: State, itemId: ItemId): PageTreeContentProps {
  const itemType = state.items[itemId].itemType
  switch (itemType) {
    case ItemType.TEXT:
      return {
        itemType: ItemType.TEXT,
        domishObjects: state.textItems[itemId].domishObjects,
      }
    case ItemType.WEB_PAGE:
      return {
        itemType: ItemType.WEB_PAGE,
        title: CurrentState.deriveWebPageItemTitle(itemId),
        faviconUrl: state.webPageItems[itemId].faviconUrl,
      }
    case ItemType.IMAGE:
      // TODO: 未対応
      throw new Error('画像アイテムは未対応')
    case ItemType.CODE_BLOCK:
      // TODO: 未対応
      throw new Error('コードブロックアイテムは未対応')
    default:
      assertNeverType(itemType)
  }
}
