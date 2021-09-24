import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

/** 対象ウェブページ項目に対応するタブをdiscardする */
export function softUnloadItem() {
  const targetItemPath = CurrentState.getTargetItemPath()

  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(
    ItemPath.getItemId(targetItemPath)
  )
  // 対応するタブがなければ何もしない
  if (tabId === undefined) return

  chrome.tabs.discard(tabId)
}

/** 対象項目のサブツリーの各ウェブページ項目に対応するタブをdiscardする */
export function softUnloadSubtree() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    for (const subtreeItemId of CurrentState.getSubtreeItemIds(selectedItemId)) {
      const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
      if (tabId !== undefined) {
        chrome.tabs.discard(tabId)
      }
    }
  }
}

/** 対象ウェブページ項目に対応するタブを閉じる */
export function hardUnloadItem() {
  const targetItemPath = CurrentState.getTargetItemPath()

  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(
    ItemPath.getItemId(targetItemPath)
  )
  // 対応するタブがなければ何もしない
  if (tabId === undefined) return

  // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
  External.instance.hardUnloadedTabIds.add(tabId)

  chrome.tabs.remove(tabId)
}

/** 対象項目のサブツリーの各ウェブページ項目に対応するタブを閉じる */
export function hardUnloadSubtree() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    for (const subtreeItemId of CurrentState.getSubtreeItemIds(selectedItemId)) {
      const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
      if (tabId !== undefined) {
        // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
        External.instance.hardUnloadedTabIds.add(tabId)

        // 対応するタブを閉じる
        chrome.tabs.remove(tabId)
      }
    }
  }
}

/** ウェブページ項目のロード操作 */
export function loadItem() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(targetItemId)
  // 対応するタブがあれば何もしない。
  // discarded状態のタブをバックグラウンドで非discarded化できれば望ましいのだがそのようなAPIが見当たらない。
  if (tabId !== undefined) return

  const url = Internal.instance.state.webPageItems[targetItemId].url
  const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
  External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(targetItemId))
  chrome.tabs.create({url, active: false})
}

/** ウェブページ項目のサブツリーロード操作 */
export function loadSubtree() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    for (const subtreeItemId of CurrentState.getSubtreeItemIds(selectedItemId)) {
      const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
      if (tabId === undefined) {
        const url = Internal.instance.state.webPageItems[subtreeItemId].url
        const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
        External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(subtreeItemId))
        chrome.tabs.create({url, active: false})
      }
    }
  }
}

/**
 * ウェブページ項目に対応するタブを最前面化する。
 * 存在しない場合はタブを開く。
 */
export function browseTab() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(targetItemId)
  if (tabId !== undefined) {
    // ウェブページ項目に対応するタブを最前面化する
    assertNonUndefined(tabId)
    chrome.tabs.update(tabId, {active: true})
    const tab = External.instance.tabItemCorrespondence.getTab(tabId)
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
