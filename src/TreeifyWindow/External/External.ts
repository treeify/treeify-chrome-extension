import {integer, ItemId, TabId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import Tab = chrome.tabs.Tab

/** TODO: コメント */
export namespace External {
  /** データベースファイル */
  export let databaseFileHandle: FileSystemFileHandle | undefined

  /** タブIDからアイテムIDへのMap */
  export const tabIdToItemId = new Map<TabId, ItemId>()
  /** アイテムIDからタブIDへのMap */
  export const itemIdToTabId = new Map<ItemId, TabId>()
  /** タブIDからTabオブジェクトへのMap */
  export const tabIdToTab = new Map<TabId, Tab>()

  /** タブIDとアイテムIDを結びつける */
  export function tieTabAndItem(tabId: TabId, itemId: ItemId) {
    tabIdToItemId.set(tabId, itemId)
    itemIdToTabId.set(itemId, tabId)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  export function untieTabAndItemByTabId(tabId: TabId) {
    const itemId = tabIdToItemId.get(tabId)
    assertNonUndefined(itemId)
    itemIdToTabId.delete(itemId)
    tabIdToItemId.delete(tabId)
  }

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  export const urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /**
   * ハードアンロードによってタブを閉じられる途中のタブIDの集合。
   * chrome.tabs.onRemovedイベント時に、タブがアンロード由来で閉じられたのかを判定するために用いる。
   */
  export const hardUnloadedTabIds = new Set<integer>()
}
