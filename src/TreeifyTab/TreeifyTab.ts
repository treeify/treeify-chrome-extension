import {TabId} from 'src/TreeifyTab/basicType'

export namespace TreeifyTab {
  /**
   * Treeifyタブを開く。
   * すでに開かれている場合はTreeifyタブを最前面化する。
   */
  export async function open() {
    const treeifyTabId = await findTabId()
    if (treeifyTabId !== undefined) {
      // すでに開かれている場合、Treeifyタブを最前面にする
      await chrome.tabs.update(treeifyTabId, {active: true})
      // TODO: Treeifyタブが所属するウィンドウをフォーカスする
      // await chrome.windows.update(treeifyWindowId, {focused: true})
    } else {
      // Treeifyタブを開く
      await chrome.tabs.create({
        url: chrome.runtime.getURL('TreeifyTab/index.html'),
      })
    }
  }

  export async function findTabId(): Promise<TabId | undefined> {
    const windows = await chrome.windows.getAll({populate: true})
    const tabs = windows.flatMap((window) => window.tabs ?? [])
    for (const tab of tabs) {
      if (tab.url === chrome.runtime.getURL('TreeifyTab/index.html')) {
        return tab.id
      }
    }
    return undefined
  }
}
