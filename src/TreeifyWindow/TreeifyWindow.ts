import {integer} from 'src/Common/integer'
import {TabId} from 'src/TreeifyWindow/basicType'

export namespace TreeifyWindow {
  /**
   * Treeifyウィンドウを開く。
   * すでに開かれている場合はTreeifyウィンドウをフォーカス（最前面化）する。
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
        url: chrome.runtime.getURL('TreeifyWindow/index.html'),
      })
    }
  }

  export async function findTabId(): Promise<TabId | undefined> {
    const windows = await chrome.windows.getAll({populate: true})
    const tabs = windows.flatMap((window) => window.tabs ?? [])
    for (const tab of tabs) {
      if (tab.url === chrome.runtime.getURL('TreeifyWindow/index.html')) {
        return tab.id
      }
    }
    return undefined
  }

  /** Treeifyウィンドウ向けのメッセージ型のUnion型 */
  export type Message = OnMouseMoveToLeftEnd | OnMouseEnter

  export type OnMouseMoveToLeftEnd = {
    type: 'OnMouseMoveToLeftEnd'
  }

  export type OnMouseEnter = {
    type: 'OnMouseEnter'
    /** event.screenX */
    x: integer
    /** event.screenY */
    y: integer
  }
}
