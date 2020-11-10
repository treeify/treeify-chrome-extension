import {integer, StableTab} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import Tab = chrome.tabs.Tab

// TODO: 永続化された値で初期化する
let nextNewStableTabId = 1

// StableTabの集まりに対するオンメモリインデックスの1つ
const stableTabMapFromTabId = new Map<integer, StableTab>()

export async function onCreated(tab: Tab) {
  assertNonUndefined(tab.id)

  const openerStableTab =
    tab.openerTabId !== undefined ? stableTabMapFromTabId.get(tab.openerTabId) : undefined

  const stableTab: StableTab = {
    stableTabId: nextNewStableTabId++,
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
