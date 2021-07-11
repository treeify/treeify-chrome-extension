import Tab = chrome.tabs.Tab

export namespace TreeifyTab {
  /**
   * Treeifyタブを開く。
   * すでに開かれている場合はTreeifyタブを最前面化する。
   */
  export async function open() {
    const treeifyTab = await findTab()
    if (treeifyTab?.id !== undefined) {
      // すでに開かれている場合、Treeifyタブを最前面にする
      await chrome.tabs.update(treeifyTab.id, {active: true})
      // Treeifyタブが所属するウィンドウをフォーカスする
      await chrome.windows.update(treeifyTab.windowId, {focused: true})
    } else {
      // Treeifyタブを開く
      await chrome.tabs.create({
        url: chrome.runtime.getURL('TreeifyTab/index.html'),
      })
    }
  }

  async function findTab(): Promise<Tab | undefined> {
    const windows = await chrome.windows.getAll({populate: true})
    const tabs = windows.flatMap((window) => window.tabs ?? [])
    return tabs.find((tab) => tab.url === chrome.runtime.getURL('TreeifyTab/index.html'))
  }
}
