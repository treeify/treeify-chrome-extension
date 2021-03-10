import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'

/** ウェブページアイテムのアンロード操作 */
export function unloadItem() {
  const focusedItemPath = NextState.getFocusedItemPath()
  if (focusedItemPath === null) return

  const tabId = Model.instance.itemIdToTabId.get(focusedItemPath.itemId)
  // 対応するタブがなければ何もしない
  if (tabId === undefined) return

  // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
  Model.instance.hardUnloadedTabIds.add(tabId)

  chrome.tabs.remove(tabId)
}

/** ウェブページアイテムのサブツリーアンロード操作 */
export function unloadSubtree() {
  const focusedItemPath = NextState.getFocusedItemPath()
  if (focusedItemPath === null) return

  for (const subtreeItemId of NextState.getSubtreeItemIds(focusedItemPath.itemId)) {
    const tabId = Model.instance.itemIdToTabId.get(subtreeItemId)
    if (tabId !== undefined) {
      // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
      Model.instance.hardUnloadedTabIds.add(tabId)

      // 対応するタブを閉じる
      chrome.tabs.remove(tabId)
    }
  }
}

/**
 * ウェブページアイテムに対応するタブを最前面化する。
 * 存在しない場合はタブを開く。
 */
export function browseWebPageItem() {
  const focusedItemPath = NextState.getFocusedItemPath()
  if (focusedItemPath === null) return

  const tabId = Model.instance.itemIdToTabId.get(focusedItemPath.itemId)
  if (tabId !== undefined) {
    // ウェブページアイテムに対応するタブを最前面化する
    assertNonUndefined(tabId)
    chrome.tabs.update(tabId, {active: true})
    const tab = Model.instance.tabIdToTab.get(tabId)
    assertNonUndefined(tab)
    chrome.windows.update(tab.windowId, {focused: true})
  } else {
    // 対応するタブがなければ開く
    const url = NextState.getWebPageItemUrl(focusedItemPath.itemId)
    const itemIds = Model.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
    Model.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(focusedItemPath.itemId))
    chrome.tabs.create({url, active: true}, (tab) => {
      chrome.windows.update(tab.windowId, {focused: true})
    })
  }
}
