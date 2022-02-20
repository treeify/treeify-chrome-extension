import Tab = chrome.tabs.Tab

export namespace TreeifyTab {
  export const url = chrome.runtime.getURL('TreeifyTab/index.html')

  export function isTreeifyTab(url: string | undefined | null): boolean {
    return url?.startsWith(TreeifyTab.url) === true
  }

  /**
   * Treeifyタブを開く。
   * すでに開かれている場合はTreeifyタブを最前面化する。
   */
  export async function open() {
    const treeifyTab = await findTab()
    if (treeifyTab?.id !== undefined) {
      // すでに開かれている場合、Treeifyタブを最前面にする
      await chrome.tabs.update(treeifyTab.id, { active: true })
      // Treeifyタブが所属するウィンドウをフォーカスする
      await chrome.windows.update(treeifyTab.windowId, { focused: true })
    } else {
      // Treeifyタブを開く
      await chrome.tabs.create({ url: TreeifyTab.url })
    }
  }

  async function findTab(): Promise<Tab | undefined> {
    const windows = await chrome.windows.getAll({ populate: true })
    const tabs = windows.flatMap((window) => window.tabs ?? [])
    return tabs.find((tab) => TreeifyTab.isTreeifyTab(tab.url))
  }
}
