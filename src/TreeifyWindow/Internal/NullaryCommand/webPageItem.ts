import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {External} from 'src/TreeifyWindow/External/External'

/** ウェブページアイテムのアンロード操作 */
export function unloadItem() {
  const targetItemPath = NextState.getTargetItemPath()

  const tabId = External.instance.itemIdToTabId.get(targetItemPath.itemId)
  // 対応するタブがなければ何もしない
  if (tabId === undefined) return

  // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
  External.instance.hardUnloadedTabIds.add(tabId)

  chrome.tabs.remove(tabId)
}

/** ウェブページアイテムのサブツリーアンロード操作 */
export function unloadSubtree() {
  const targetItemPath = NextState.getTargetItemPath()

  for (const subtreeItemId of NextState.getSubtreeItemIds(targetItemPath.itemId)) {
    const tabId = External.instance.itemIdToTabId.get(subtreeItemId)
    if (tabId !== undefined) {
      // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
      External.instance.hardUnloadedTabIds.add(tabId)

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
  const targetItemPath = NextState.getTargetItemPath()

  const tabId = External.instance.itemIdToTabId.get(targetItemPath.itemId)
  if (tabId !== undefined) {
    // ウェブページアイテムに対応するタブを最前面化する
    assertNonUndefined(tabId)
    chrome.tabs.update(tabId, {active: true})
    const tab = External.instance.tabIdToTab.get(tabId)
    assertNonUndefined(tab)
    chrome.windows.update(tab.windowId, {focused: true})
  } else {
    // 対応するタブがなければ開く
    const url = NextState.getWebPageItemUrl(targetItemPath.itemId)
    const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
    External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(targetItemPath.itemId))
    chrome.tabs.create({url, active: true}, (tab) => {
      chrome.windows.update(tab.windowId, {focused: true})
    })
  }
}

/** ウェブページアイテムのタイトル設定ダイアログを表示する */
export function showWebPageItemTitleSettingDialog() {
  NextState.setWebPageItemTitleSettingDialog({})
}
