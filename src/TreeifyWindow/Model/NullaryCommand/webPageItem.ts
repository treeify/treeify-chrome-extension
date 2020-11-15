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
