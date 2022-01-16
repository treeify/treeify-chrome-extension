import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type WebPageItemContentProps = {
  title: string
  faviconUrl: string
  isDiscarded: boolean
  isTabClosed: boolean
  isUnread: boolean
  isAudible: boolean
}

export function createWebPageItemContentProps(itemId: ItemId): ItemContentProps {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabId(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined

  return {
    type: 'WebPageItemContentProps',
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: Internal.instance.state.webPageItems[itemId].faviconUrl,
    isDiscarded: tab?.discarded === true,
    isTabClosed: tab === undefined,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
  }
}
