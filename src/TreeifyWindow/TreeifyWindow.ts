import CreateData = chrome.windows.CreateData
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import UAParser from 'ua-parser-js'

export namespace TreeifyWindow {
  const initialWidth = 400

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
        // TODO: フルウィンドウモードで終了した場合は、次回起動時もフルウィンドウモードになってほしい気がする
        state: 'normal',
        width: readNarrowWidth() ?? initialWidth,
        height: screen.availHeight,
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

  /** デュアルウィンドウモードかどうか判定する */
  export async function isDualWindowMode(): Promise<boolean> {
    const windows = await getAllNormalWindows()
    for (const window of windows) {
      if (window.left === undefined || window.width === undefined) continue
      if (window.top === undefined || window.height === undefined) continue

      const windowRight = window.left + window.width
      const windowBottom = window.top + window.height
      const screenRight = screenX + innerWidth
      const screenBottom = screenY + innerHeight
      const hasOverlap =
        Math.max(screenX, window.left) <= Math.min(screenRight, windowRight) &&
        Math.max(screenY, window.top) <= Math.min(screenBottom, windowBottom)

      if (!hasOverlap) {
        // Treeifyウィンドウと重なっていないブラウザウィンドウが1つでもあればデュアルウィンドウモードと判定する
        return true
      }
    }

    return false
  }

  /** デュアルウィンドウモードに変更する */
  export async function toDualWindowMode() {
    // Treeifyウィンドウの幅や位置を変更する
    const treeifyWindowId = await findWindowId()
    assertNonUndefined(treeifyWindowId)
    const treeifyWindowWidth = readNarrowWidth() ?? initialWidth
    chrome.windows.update(treeifyWindowId, {
      state: 'normal',
      left: 0,
      top: 0,
      width: treeifyWindowWidth,
      height: screen.availHeight,
    })

    // ブラウザウィンドウの幅や位置を変更する
    for (const window of await getAllNormalWindows()) {
      chrome.windows.update(window.id, {
        state: 'normal',
        left: treeifyWindowWidth,
        top: 0,
        width: screen.availWidth - treeifyWindowWidth,
        height: screen.availHeight,
      })
    }
  }

  /** フルウィンドウモードに変更する */
  export async function toFullWindowMode() {
    if (new UAParser().getOS().name !== 'Mac OS') {
      // ブラウザウィンドウの幅や位置を変更する
      for (const window of await getAllNormalWindows()) {
        chrome.windows.update(window.id, {
          state: 'maximized',
          focused: false,
        })
      }

      // Treeifyウィンドウの幅や位置を変更する
      const treeifyWindowId = await findWindowId()
      assertNonUndefined(treeifyWindowId)
      chrome.windows.update(treeifyWindowId, {
        state: 'maximized',
        focused: true,
      })
    } else {
      // Macではウィンドウの最大化の概念を他OSと別に扱う

      // ブラウザウィンドウの幅や位置を変更する
      for (const window of await getAllNormalWindows()) {
        chrome.windows.update(window.id, {
          state: 'normal',
          left: 0,
          top: 0,
          width: screen.availWidth,
          height: screen.availHeight,
          focused: false,
        })
      }

      // Treeifyウィンドウの幅や位置を変更する
      const treeifyWindowId = await findWindowId()
      assertNonUndefined(treeifyWindowId)
      chrome.windows.update(treeifyWindowId, {
        state: 'normal',
        left: 0,
        top: 0,
        width: screen.availWidth,
        height: screen.availHeight,
        focused: true,
      })
    }
  }

  async function getAllNormalWindows(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      chrome.windows.getAll({windowTypes: ['normal']}, (windows) => {
        resolve(windows)
      })
    })
  }

  export function writeNarrowWidth(width: integer) {
    localStorage.setItem('treeifyWindowNarrowWidth', width.toString())
  }

  export function readNarrowWidth(): integer | undefined {
    const savedValue = localStorage.getItem('treeifyWindowNarrowWidth')
    if (savedValue === null) return undefined

    return parseInt(savedValue)
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
