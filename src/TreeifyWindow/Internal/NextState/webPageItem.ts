import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {Timestamp} from 'src/Common/Timestamp'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {Item, WebPageItem} from 'src/TreeifyWindow/Internal/State'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

/**
 * 新しい空のウェブページアイテムを作成し、NextStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createWebPageItem(): ItemId {
  const newItemId = Internal.instance.state.nextNewItemId

  const newItem: Item = {
    itemId: newItemId,
    itemType: ItemType.WEB_PAGE,
    childItemIds: List.of(),
    parentItemIds: List.of(),
    isFolded: false,
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('items', newItemId))

  const webPageItem: WebPageItem = {
    url: '',
    faviconUrl: '',
    tabTitle: '',
    title: null,
  }
  Internal.instance.state.webPageItems[newItemId] = webPageItem
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', newItemId))

  NextState.setNextNewItemId(newItemId + 1)

  return newItemId
}

/** StateのwebPageItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteWebPageItemEntry(itemId: ItemId) {
  delete Internal.instance.state.webPageItems[itemId]
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', itemId))
}

/** ウェブページアイテムのタブタイトルを設定する */
export function setWebPageItemTabTitle(itemId: ItemId, tabTitle: string) {
  Internal.instance.state.webPageItems[itemId].tabTitle = tabTitle
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', itemId, 'tabTitle'))
}

/** ウェブページアイテムのタイトルを設定する */
export function setWebPageItemTitle(itemId: ItemId, title: string | null) {
  Internal.instance.state.webPageItems[itemId].title = title
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', itemId, 'title'))
}

/** ウェブページアイテムのURLを設定する */
export function setWebPageItemUrl(itemId: ItemId, url: string) {
  Internal.instance.state.webPageItems[itemId].url = url
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', itemId, 'url'))
}

/** ウェブページアイテムのファビコンURLを設定する */
export function setWebPageItemFaviconUrl(itemId: ItemId, url: string) {
  Internal.instance.state.webPageItems[itemId].faviconUrl = url
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItems', itemId, 'faviconUrl'))
}
