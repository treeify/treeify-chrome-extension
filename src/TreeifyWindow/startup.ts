import {html, render} from 'lit-html'
import {integer} from 'src/Common/basicType'
import {assertNonNull} from 'src/Common/Debug/assert'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
  onWindowFocusChanged,
} from 'src/TreeifyWindow/External/chromeEventListeners'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import UAParser from 'ua-parser-js'

export async function startup(initialState: State) {
  External.instance.lastFocusedWindowId = await getLastFocusedWindowId()

  Internal.initialize(initialState)

  // Treeifyウィンドウ起動時点で既に存在するタブをウェブページアイテムと紐付ける
  await matchTabsAndWebPageItems()

  External.instance.render(initialState)

  Internal.instance.addStateChangeListener(onStateChange)

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)

  chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseenter', onMouseEnter)

  window.addEventListener('resize', onResize)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('resize', onResize)

  document.removeEventListener('mouseenter', onMouseEnter)
  document.removeEventListener('mousemove', onMouseMove)

  chrome.windows.onFocusChanged.removeListener(onWindowFocusChanged)

  chrome.tabs.onCreated.removeListener(onCreated)
  chrome.tabs.onUpdated.removeListener(onUpdated)
  chrome.tabs.onRemoved.removeListener(onRemoved)
  chrome.tabs.onActivated.removeListener(onActivated)

  chrome.runtime.onMessage.removeListener(onMessage)

  Internal.cleanup()
  External.cleanup()

  const spaRoot = document.querySelector('.spa-root')
  assertNonNull(spaRoot)
  render(html``, spaRoot)
}

function onStateChange(newState: State, mutatedPropertyPaths: Set<PropertyPath>) {
  External.instance.rerender(newState)
  External.instance.postMutatedPropertyPaths(newState, mutatedPropertyPaths)
}

function onMouseMove(event: MouseEvent) {
  // マウスの位置と動きに応じて左サイドバーを開閉する
  if (!External.instance.shouldFloatingLeftSidebarShown) {
    // マウスポインターが画面左端に到達した時。
    // Treeifyウィンドウの左端が画面左端に近くないと発動しない点に注意。
    // 逆に言うと、Treeifyウィンドウが画面左端にぴったりくっついていなくても割とルーズに発動してくれる。
    if (event.screenX + event.movementX <= 0 && event.movementX < 0) {
      External.instance.shouldFloatingLeftSidebarShown = true
      CurrentState.commit()
    }
  } else {
    const leftSidebar = document.querySelector('.left-sidebar')
    assertNonNull(leftSidebar)
    if (event.x > leftSidebar.getBoundingClientRect().right) {
      // mouseleaveイベントを使わない理由は、Treeifyウィンドウが画面左端にぴったりくっついていない状況で、
      // マウスを画面左端に動かしたときに左サイドバーが閉じられてしまうことを防ぐため。
      External.instance.shouldFloatingLeftSidebarShown = false
      CurrentState.commit()
    }
  }
}

function onMouseEnter() {
  // Macではフォーカスを持っていないウィンドウの操作に一手間かかるので、マウスが乗った時点でフォーカスする
  if (
    new UAParser().getOS().name === 'Mac OS' &&
    External.instance.lastFocusedWindowId !== chrome.windows.WINDOW_ID_NONE
  ) {
    TreeifyWindow.open()
  }
}

function onResize() {
  // 左サイドバーの表示形態を変更する必要があるかもしれないので再描画する
  CurrentState.commit()
}

async function getLastFocusedWindowId(): Promise<integer> {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused((window) => resolve(window.id))
  })
}
