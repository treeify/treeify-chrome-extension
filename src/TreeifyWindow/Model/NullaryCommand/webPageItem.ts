import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'

/** ウェブページアイテムのアンロード操作 */
export function unloadItem() {
  const focusedItemPath = NextState.getFocusedItemPath()
  if (focusedItemPath === null) return

  // 対応するタブがあれば閉じる
  const tabId = NextState.getWebPageItemTabId(focusedItemPath.itemId)
  if (tabId === undefined) return
  chrome.tabs.remove(tabId)
}

/** ウェブページアイテムのサブツリーアンロード操作 */
export function unloadSubtree() {
  const focusedItemPath = NextState.getFocusedItemPath()
  if (focusedItemPath === null) return

  for (const subtreeItemId of NextState.getSubtreeItemIds(focusedItemPath.itemId)) {
    // 対応するタブがあれば閉じる
    const tabId = NextState.getWebPageItemTabId(subtreeItemId)
    if (tabId !== undefined) {
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

  const stableTabId = Model.instance.currentState.webPageItems[focusedItemPath.itemId].stableTabId
  if (stableTabId !== null) {
    // ウェブページアイテムに対応するタブを最前面化する
    const stableTab = Model.instance.currentState.stableTabs[stableTabId]
    assertNonUndefined(stableTab.id)
    chrome.tabs.update(stableTab.id, {active: true})
    chrome.windows.update(stableTab.windowId, {focused: true})
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
