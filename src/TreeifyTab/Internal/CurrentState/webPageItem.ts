import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Item, WebPageItem } from 'src/TreeifyTab/Internal/State'
import { Timestamp } from 'src/Utility/Timestamp'

/** 新しい空のウェブページ項目を作成する。ただし項目の配置（親子関係の設定）は行わない */
export function createWebPageItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.WEB_PAGE,
    globalItemId: GlobalItemId.generate(),
    childItemIds: [],
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: [],
    source: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const webPageItem: WebPageItem = {
    url: '',
    faviconUrl: '',
    tabTitle: '',
    title: null,
    isUnread: false,
  }
  Internal.instance.mutate(webPageItem, PropertyPath.of('webPageItems', newItemId))

  return newItemId
}

/** StateのwebPageItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteWebPageItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('webPageItems', itemId))
}

/** ウェブページ項目のタブタイトルを設定する */
export function setWebPageItemTabTitle(itemId: ItemId, tabTitle: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(tabTitle, PropertyPath.of('webPageItems', itemId, 'tabTitle'))
  })
}

/** ウェブページ項目のタイトルを設定する */
export function setWebPageItemTitle(itemId: ItemId, title: string | null) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(title, PropertyPath.of('webPageItems', itemId, 'title'))
  })
}

/** ウェブページ項目のURLを設定する */
export function setWebPageItemUrl(itemId: ItemId, url: string) {
  Internal.instance.mutate(url, PropertyPath.of('webPageItems', itemId, 'url'))
}

/** ウェブページ項目のファビコンURLを設定する */
export function setWebPageItemFaviconUrl(itemId: ItemId, url: string) {
  Internal.instance.mutate(url, PropertyPath.of('webPageItems', itemId, 'faviconUrl'))
}

export function deriveWebPageItemTitle(itemId: ItemId): string {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  const title = webPageItem.title ?? webPageItem.tabTitle
  return title !== '' ? title : webPageItem.url
}

/** ウェブページ項目の未読フラグを上書き設定する */
export function setIsUnreadFlag(itemId: ItemId, isUnread: boolean) {
  Internal.instance.mutate(isUnread, PropertyPath.of('webPageItems', itemId, 'isUnread'))
}
