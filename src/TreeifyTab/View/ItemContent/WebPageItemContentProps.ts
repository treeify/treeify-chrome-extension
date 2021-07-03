import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

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
