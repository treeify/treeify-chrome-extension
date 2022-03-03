import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type WebPageItemContentProps = {
  title: string
  faviconUrl: string
  cssClasses: RArray<string>
  isDiscarded: boolean
  isTabClosed: boolean
  isUnread: boolean
}

export function createWebPageItemContentProps(itemId: ItemId): ItemContentProps {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  const tab = External.instance.tabItemCorrespondence.getTabByItemId(itemId)

  return {
    type: 'WebPageItemContentProps',
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: Internal.instance.state.webPageItems[itemId].faviconUrl,
    cssClasses: Internal.instance.state.items[itemId].cssClasses,
    isDiscarded: tab?.discarded === true,
    isTabClosed: tab === undefined,
    isUnread: webPageItem.isUnread,
  }
}
