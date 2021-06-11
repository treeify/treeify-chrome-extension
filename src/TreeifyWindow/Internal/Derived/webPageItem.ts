import {ItemId} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {derived, get, Readable} from 'svelte/store'

export function deriveWebPageItemTitle(itemId: ItemId): Readable<string> {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  return derived([webPageItem.title, webPageItem.tabTitle, webPageItem.url], () => {
    const title = get(webPageItem.title) ?? get(webPageItem.tabTitle)
    return title !== '' ? title : get(webPageItem.url)
  })
}
