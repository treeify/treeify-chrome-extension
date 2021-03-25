import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyWindow/External/External'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

/** 対象ウェブページアイテムに対応するタブを閉じる */
export function hardUnloadItem() {
  const targetItemPath = NextState.getTargetItemPath()

  const tabId = External.instance.itemIdToTabId.get(ItemPath.getItemId(targetItemPath))
  // 対応するタブがなければ何もしない
  if (tabId === undefined) return

  // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
  External.instance.hardUnloadedTabIds.add(tabId)

  chrome.tabs.remove(tabId)
}

/** 対象アイテムのサブツリーの各ウェブページアイテムに対応するタブを閉じる */
export function hardUnloadSubtree() {
  const targetItemId = ItemPath.getItemId(NextState.getTargetItemPath())

  for (const subtreeItemId of NextState.getSubtreeItemIds(targetItemId)) {
    const tabId = External.instance.itemIdToTabId.get(subtreeItemId)
    if (tabId !== undefined) {
      // chrome.tabs.onRemovedイベントリスナー内でウェブページアイテムが削除されないよう根回しする
      External.instance.hardUnloadedTabIds.add(tabId)

      // 対応するタブを閉じる
      chrome.tabs.remove(tabId)
    }
  }
}

/** ウェブページアイテムのロード操作 */
export function loadItem() {
  const targetItemId = ItemPath.getItemId(NextState.getTargetItemPath())
  const tabId = External.instance.itemIdToTabId.get(targetItemId)
  // 対応するタブがあれば何もしない
  if (tabId !== undefined) return

  const url = Internal.instance.state.webPageItems[targetItemId].url
  const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
  External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(targetItemId))
  chrome.tabs.create({url, active: false})
}

/** ウェブページアイテムのサブツリーロード操作 */
export function loadSubtree() {
  const targetItemId = ItemPath.getItemId(NextState.getTargetItemPath())
  for (const subtreeItemId of NextState.getSubtreeItemIds(targetItemId)) {
    const tabId = External.instance.itemIdToTabId.get(subtreeItemId)
    if (tabId === undefined) {
      const url = Internal.instance.state.webPageItems[subtreeItemId].url
      const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
      External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(subtreeItemId))
      chrome.tabs.create({url, active: false})
    }
  }
}

/**
 * ウェブページアイテムに対応するタブを最前面化する。
 * 存在しない場合はタブを開く。
 */
export function browseWebPageItem() {
  const targetItemPath = NextState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const tabId = External.instance.itemIdToTabId.get(targetItemId)
  if (tabId !== undefined) {
    // ウェブページアイテムに対応するタブを最前面化する
    assertNonUndefined(tabId)
    chrome.tabs.update(tabId, {active: true})
    const tab = External.instance.tabIdToTab.get(tabId)
    assertNonUndefined(tab)
    chrome.windows.update(tab.windowId, {focused: true})
  } else {
    // 対応するタブがなければ開く
    const url = Internal.instance.state.webPageItems[targetItemId].url
    const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
    External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(targetItemId))
    chrome.tabs.create({url, active: true}, (tab) => {
      chrome.windows.update(tab.windowId, {focused: true})
    })
  }
}
