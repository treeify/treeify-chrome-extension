import CreateData = chrome.windows.CreateData
import UpdateInfo = chrome.windows.UpdateInfo
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
      await createWindow(
        fillWindowGaps({
          url: chrome.runtime.getURL('TreeifyWindow/index.html'),
          type: 'popup',
          // TODO: フルウィンドウモードで終了した場合は、次回起動時もフルウィンドウモードになってほしい気がする
          state: 'normal',
          width: readNarrowWidth() ?? initialWidth,
          height: screen.availHeight,
          top: 0,
          left: 0,
        })
      )
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
            if (window.tabs[0].url === chrome.runtime.getURL('TreeifyWindow/index.html')) {
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

  /** フルウィンドウモードかどうか判定する */
  export async function isFullWindowMode(): Promise<boolean> {
    const windows = await getAllNormalWindows()
    for (const window of windows) {
      if (!isFullSize(window)) return false
    }

    const treeifyWindow = await getTreeifyWindow()
    return isFullSize(treeifyWindow)
  }

  function isFullSize(window: chrome.windows.Window): boolean {
    assertNonUndefined(window.width)
    assertNonUndefined(window.height)
    return (window.width * window.height) / (screen.availWidth * screen.availHeight) >= 0.9
  }

  async function getTreeifyWindow(): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
      chrome.windows.getAll({populate: true, windowTypes: ['popup']}, (windows) => {
        for (const window of windows) {
          if (window.tabs?.length === 1) {
            if (window.tabs[0].url === chrome.runtime.getURL('TreeifyWindow/index.html')) {
              resolve(window)
              return
            }
          }
        }
        reject()
      })
    })
  }

  /** デュアルウィンドウモードに変更する */
  export async function toDualWindowMode() {
    // Treeifyウィンドウの幅や位置を変更する
    const treeifyWindowId = await findWindowId()
    assertNonUndefined(treeifyWindowId)
    const treeifyWindowWidth = readNarrowWidth() ?? initialWidth
    chrome.windows.update(
      treeifyWindowId,
      fillWindowGaps({
        state: 'normal',
        left: 0,
        top: 0,
        width: treeifyWindowWidth,
        height: screen.availHeight,
      })
    )

    // ブラウザウィンドウの幅や位置を変更する
    for (const window of await getAllNormalWindows()) {
      if (window.id === undefined) continue

      chrome.windows.update(
        window.id,
        fillWindowGaps({
          state: 'normal',
          left: treeifyWindowWidth,
          top: 0,
          width: screen.availWidth - treeifyWindowWidth,
          height: screen.availHeight,
        })
      )
    }
  }

  /** フルウィンドウモードに変更する */
  export async function toFullWindowMode() {
    // 既にフルウィンドウモードなら何もしない（ちらつき対策）
    if (await isFullWindowMode()) return

    if (new UAParser().getOS().name !== 'Mac OS') {
      // ブラウザウィンドウの幅や位置を変更する
      for (const window of await getAllNormalWindows()) {
        if (window.id === undefined) continue

        chrome.windows.update(window.id, {
          state: 'maximized',
          // 画面がちらつくので本当はfocused: falseにしたいのだがstate: 'maximized'と組み合わせるとエラーになるので妥協
          focused: true,
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
        if (window.id === undefined) continue

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

  // Windowsでウィンドウの左端、右端、下端に隙間ができる問題への対策用関数
  function fillWindowGaps(rawData: UpdateInfo | CreateData): UpdateInfo | CreateData {
    if (new UAParser().getOS().name === 'Windows') {
      // TODO: おそらく次の式で正確なgapを取得できる
      // mouseEvent.screenX - mouseEvent.clientX
      const gapPx = 8
      const cloned = {...rawData}
      if (cloned.left !== undefined) {
        cloned.left -= gapPx
      }
      if (cloned.width !== undefined) {
        cloned.width += 2 * gapPx
      }
      if (cloned.height !== undefined) {
        cloned.height += gapPx
      }
      return cloned
    }
    return rawData
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
