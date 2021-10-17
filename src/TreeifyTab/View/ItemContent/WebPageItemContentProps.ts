import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

export type WebPageItemContentProps = {
  itemType: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  isDiscarded: boolean
  isTabClosed: boolean
  isUnread: boolean
  isAudible: boolean
}

export function createWebPageItemContentProps(itemId: ItemId): WebPageItemContentProps {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined

  return {
    itemType: ItemType.WEB_PAGE,
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: Internal.instance.state.webPageItems[itemId].faviconUrl,
    isDiscarded: tab?.discarded === true,
    isTabClosed: tab === undefined,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
  }
}
