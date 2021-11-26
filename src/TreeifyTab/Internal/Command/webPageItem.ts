import { List } from 'immutable'
import { ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

/** 対象ウェブページ項目に対応するタブをdiscardする */
export function discardItemTab() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(selectedItemId)
    if (tabId !== undefined) {
      chrome.tabs.discard(tabId)
    }
  }
}

/** 対象項目のサブツリーの各ウェブページ項目に対応するタブをdiscardする */
export function discardSubtreeTabs() {
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
export function closeItemTab() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(
      ItemPath.getItemId(selectedItemPath)
    )

    if (tabId !== undefined) {
      // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
      External.instance.tabIdsToBeClosedForUnloading.add(tabId)

      chrome.tabs.remove(tabId)
    }
  }
}

/** 対象項目のサブツリーの各ウェブページ項目に対応するタブを閉じる */
export function closeSubtreeTabs() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    for (const subtreeItemId of CurrentState.getSubtreeItemIds(selectedItemId)) {
      const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
      if (tabId !== undefined) {
        // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
        External.instance.tabIdsToBeClosedForUnloading.add(tabId)

        // 対応するタブを閉じる
        chrome.tabs.remove(tabId)
      }
    }
  }
}

/** ウェブページ項目のロード操作 */
export function loadItem() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(selectedItemId)
    if (tabId === undefined) {
      const url = Internal.instance.state.webPageItems[selectedItemId].url
      const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
      External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(selectedItemId))
      chrome.tabs.create({ url, active: false })
    }
  }
}

/** ウェブページ項目のサブツリーロード操作 */
export function loadSubtree() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    for (const subtreeItemId of CurrentState.getSubtreeItemIds(selectedItemId)) {
      if (Internal.instance.state.items[subtreeItemId].type !== ItemType.WEB_PAGE) {
        continue
      }

      const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
      if (tabId === undefined) {
        const url = Internal.instance.state.webPageItems[subtreeItemId].url
        const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
        External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(subtreeItemId))
        chrome.tabs.create({ url, active: false })
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
    chrome.tabs.update(tabId, { active: true })
    const tab = External.instance.tabItemCorrespondence.getTab(tabId)
    assertNonUndefined(tab)
    chrome.windows.update(tab.windowId, { focused: true })
  } else {
    // 対応するタブがなければ開く
    const url = Internal.instance.state.webPageItems[targetItemId].url
    const itemIds = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
    External.instance.urlToItemIdsForTabCreation.set(url, itemIds.push(targetItemId))
    chrome.tabs.create({ url, active: true }, (tab) => {
      chrome.windows.update(tab.windowId, { focused: true })
    })
  }
}
