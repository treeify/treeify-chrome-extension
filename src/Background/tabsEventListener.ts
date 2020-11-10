import {StableTab} from 'src/Common/basicType'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import Tab = chrome.tabs.Tab

// TODO: 永続化された値で初期化する
let nextNewStableTabId = 1

export async function onCreated(tab: Tab) {
  const stableTab: StableTab = {
    stableTabId: nextNewStableTabId++,
    ...tab,
  }

  if (await TreeifyWindow.exists()) {
    // TODO: Treeifyウィンドウが存在したとしてもready状態かどうかは分からないのでは？

    // Treeifyウィンドウが存在するときはイベントを転送する
    TreeifyWindow.sendMessage({
      type: 'OnTabCreated',
      stableTab,
    })
  }
}
