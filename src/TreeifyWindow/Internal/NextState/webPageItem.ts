import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {Timestamp} from 'src/Common/Timestamp'
import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {Item, WebPageItem} from 'src/TreeifyWindow/Internal/State'

/**
 * 新しい空のウェブページアイテムを作成し、NextStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createWebPageItem(): ItemId {
  const newItemId = NextState.getNextNewItemId()

  const newItem: Item = {
    itemId: newItemId,
    itemType: ItemType.WEB_PAGE,
    childItemIds: List.of(),
    parentItemIds: List.of(),
    isFolded: false,
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
  }
  NextState.getBatchizer().postSetMutation(PropertyPath.of('items', newItemId), newItem)

  const webPageItem: WebPageItem = {
    itemId: newItemId,
    url: '',
    faviconUrl: '',
    tabTitle: '',
    title: null,
  }
  NextState.getBatchizer().postSetMutation(PropertyPath.of('webPageItems', newItemId), webPageItem)

  NextState.setNextNewItemId(newItemId + 1)

  return newItemId
}

/** ウェブページアイテムのタブタイトルを設定する */
export function setWebPageItemTabTitle(itemId: ItemId, tabTitle: string) {
  NextState.getBatchizer().postSetMutation(
    PropertyPath.of('webPageItems', itemId, 'tabTitle'),
    tabTitle
  )
}

/** ウェブページアイテムのURLを返す */
export function getWebPageItemUrl(itemId: ItemId): string {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('webPageItems', itemId, 'url'))
}

/** ウェブページアイテムのURLを設定する */
export function setWebPageItemUrl(itemId: ItemId, url: string) {
  NextState.getBatchizer().postSetMutation(PropertyPath.of('webPageItems', itemId, 'url'), url)
}

/** ウェブページアイテムのファビコンURLを設定する */
export function setWebPageItemFaviconUrl(itemId: ItemId, url: string) {
  NextState.getBatchizer().postSetMutation(
    PropertyPath.of('webPageItems', itemId, 'faviconUrl'),
    url
  )
}
