import CreateData = chrome.windows.CreateData
import {integer} from 'src/Common/basicType'

export namespace TreeifyWindow {
  /**
   * Treeifyウィンドウを開く。
   * すでに開かれている場合はTreeifyウィンドウをフォーカス（最前面化）する。
   */
  export async function open() {
    const treeifyWindowId = await findWindowId()
    if (treeifyWindowId !== undefined) {
      // すでに開かれている場合、ウィンドウをフォーカスする
      await focusWindow(treeifyWindowId)
    } else {
      // Treeifyウィンドウを開く
      await createWindow({
        url: chrome.extension.getURL('TreeifyWindow/index.html'),
        type: 'popup',
        // TODO: ウィンドウの位置やサイズを記憶する
        width: 400,
        height: 1200,
        top: 0,
        left: 0,
      })
    }
  }

  /** Treeifyウィンドウが既に存在するならtrueを返す */
  export async function exists(): Promise<boolean> {
    return (await findWindowId()) !== undefined
  }

  /**
   * TreeifyウィンドウのウィンドウIDを取得する。
   * もしTreeifyウィンドウが存在しない場合はundefinedを返す。
   */
  export function findWindowId(): Promise<integer | undefined> {
    return new Promise((resolve, reject) => {
      chrome.windows.getAll({populate: true, windowTypes: ['popup']}, (windows) => {
        for (const window of windows) {
          if (window.tabs?.length === 1) {
            if (window.tabs[0].url === chrome.extension.getURL('TreeifyWindow/index.html')) {
              resolve(window.id)
              return
            }
          }
        }
        resolve(undefined)
      })
    })
  }

  // chrome.windows.create関数をasync化したユーティリティ関数。
  // ただしこのPromiseをawaitしても、そのページ内のJavaScriptが読み込み完了になっているわけではない。
  async function createWindow(createData: CreateData): Promise<chrome.windows.Window | undefined> {
    return new Promise((resolve, reject) => {
      chrome.windows.create(createData, (window) => {
        resolve(window)
      })
    })
  }

  // ウィンドウをフォーカスする
  async function focusWindow(windowId: integer): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.windows.update(windowId, {focused: true}, () => resolve())
    })
  }

  /** Treeifyウィンドウ宛のメッセージを送信する */
  export function sendMessage(message: Message) {
    chrome.runtime.sendMessage(message)
  }

  /** Treeifyウィンドウ向けのメッセージ型のUnion型 */
  export type Message = OnMouseMoveToLeftEnd

  export type OnMouseMoveToLeftEnd = {
    type: 'OnMouseMoveToLeftEnd'
  }
}
