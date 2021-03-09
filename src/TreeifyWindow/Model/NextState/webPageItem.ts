import {List} from 'immutable'
import {integer, ItemId, ItemType, StableTabId} from 'src/Common/basicType'
import {Timestamp} from 'src/Common/Timestamp'
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {NextState} from 'src/TreeifyWindow/Model/NextState/index'
import {Item, WebPageItem} from 'src/TreeifyWindow/Model/State'

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
    stableTabId: null,
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
export function setWebPageItemStableTabId(itemId: ItemId, stableTabId: StableTabId | null) {
  if (stableTabId !== null) {
    NextState.getBatchizer().postSetMutation(
      PropertyPath.of('webPageItems', itemId, 'stableTabId'),
      stableTabId
    )

    // 逆引き用インデックスを更新
    NextState.getBatchizer().postSetMutation(
      PropertyPath.of('stableTabIdToItemId', stableTabId),
      itemId
    )
  } else {
    const oldStableTabId = NextState.getBatchizer().getDerivedValue(
      PropertyPath.of('webPageItems', itemId, 'stableTabId')
    )

    NextState.getBatchizer().postSetMutation(
      PropertyPath.of('webPageItems', itemId, 'stableTabId'),
      null
    )

    if (oldStableTabId !== undefined) {
      // 逆引き用インデックスを更新
      NextState.getBatchizer().deleteProperty(
        PropertyPath.of('stableTabIdToItemId', oldStableTabId)
      )
    }
  }
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

/** ウェブページアイテムと紐付いているタブのIDを返す */
export function getWebPageItemTabId(itemId: ItemId): integer | undefined {
  const stableTabId = NextState.getBatchizer().getDerivedValue(
    PropertyPath.of('webPageItems', itemId, 'stableTabId')
  )
  if (stableTabId === null) return undefined

  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('stableTabs', stableTabId, 'id'))
}
