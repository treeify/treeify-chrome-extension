import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type WebPageItemContentProps = {
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
}

export function createWebPageItemContentProps(itemId: ItemId): WebPageItemContentProps {
  return {
    itemType: ItemType.WEB_PAGE,
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: Internal.instance.state.webPageItems[itemId].faviconUrl,
  }
}
