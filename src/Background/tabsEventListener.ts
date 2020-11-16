import {BackgroundPageState} from 'src/Background/BackgroundPageState'
import {integer, StableTab} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import Tab = chrome.tabs.Tab
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo

/** 現時点で存在するタブの情報を収集し、必要に応じてStableTabIdの発行などを行う */
export async function processExistingTabs() {
  const allTabs = await getAllNormalTabs()
  for (const tab of allTabs) {
    await onCreated(tab)
  }
}

async function getAllNormalTabs(): Promise<Tab[]> {
  return new Promise((resolve) => {
    chrome.windows.getAll({populate: true, windowTypes: ['normal']}, (windows) => {
      resolve(windows.flatMap((window) => window.tabs ?? []))
    })
  })
}

export async function onCreated(tab: Tab) {
  assertNonUndefined(tab.id)

  const stableTabMapFromTabId = BackgroundPageState.instance.stableTabMapFromTabId
  const openerStableTab =
    tab.openerTabId !== undefined ? stableTabMapFromTabId.get(tab.openerTabId) : undefined

  const stableTab: StableTab = {
    stableTabId: BackgroundPageState.instance.nextNewStableTabId++,
    opener: openerStableTab?.stableTabId ?? null,
    ...tab,
  }
  stableTabMapFromTabId.set(stableTab.id!, stableTab)

  if (await TreeifyWindow.exists()) {
    // TODO: Treeifyウィンドウが存在したとしてもready状態かどうかは分からないのでは？

    // Treeifyウィンドウが存在するときはイベントを転送する
    TreeifyWindow.sendMessage({
      type: 'OnTabCreated',
      stableTab,
    })
  }
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  assertNonUndefined(tab.id)

  const stableTabMapFromTabId = BackgroundPageState.instance.stableTabMapFromTabId
  const existingStableTab = stableTabMapFromTabId.get(tab.id)
  assertNonUndefined(existingStableTab)
  const stableTab: StableTab = {
    stableTabId: existingStableTab.stableTabId,
    opener: existingStableTab.opener,
    ...tab,
  }

  if (await TreeifyWindow.exists()) {
    // TODO: Treeifyウィンドウが存在したとしてもready状態かどうかは分からないのでは？

    // Treeifyウィンドウが存在するときはイベントを転送する
    TreeifyWindow.sendMessage({
      type: 'OnTabUpdated',
      changeInfo,
      stableTab,
    })
  }
}

export async function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  const stableTabMapFromTabId = BackgroundPageState.instance.stableTabMapFromTabId
  const existingStableTab = stableTabMapFromTabId.get(tabId)
  assertNonUndefined(existingStableTab)

  if (await TreeifyWindow.exists()) {
    // TODO: Treeifyウィンドウが存在したとしてもready状態かどうかは分からないのでは？

    // Treeifyウィンドウが存在するときはイベントを転送する
    TreeifyWindow.sendMessage({
      type: 'OnTabClosed',
      stableTabId: existingStableTab.stableTabId,
    })
  }
}
