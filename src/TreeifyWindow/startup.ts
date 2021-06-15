import {assertNonNull} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {doAsyncWithErrorCapture, doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
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
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import UAParser from 'ua-parser-js'

export async function startup(initialState: State) {
  External.instance.lastFocusedWindowId = await getLastFocusedWindowId()

  Internal.initialize(initialState)

  // Treeifyウィンドウ起動時点で既に存在するタブをウェブページアイテムと紐付ける
  await matchTabsAndWebPageItems()

  External.instance.render(initialState)

  Internal.instance.addOnMutateListener(onMutateState)

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)

  chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)

  document.addEventListener('mousemove', onMouseMove)

  window.addEventListener('resize', onResize)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('resize', onResize)

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
  spaRoot.innerHTML = ''
}

function onMutateState(propertyPath: PropertyPath) {
  External.instance.onMutateState(propertyPath)
}

function onMouseMove(event: MouseEvent) {
  doWithErrorCapture(() => {
    // Macではフォーカスを持っていないウィンドウの操作に一手間かかるので、マウスが乗った時点でフォーカスする
    if (
      new UAParser().getOS().name === 'Mac OS' &&
      External.instance.lastFocusedWindowId !== chrome.windows.WINDOW_ID_NONE
    ) {
      TreeifyWindow.open()
    }

    // マウスの位置と動きに応じて左サイドバーを開閉する
    if (!External.instance.shouldFloatingLeftSidebarShown) {
      // マウスポインターが画面左端に到達した時。
      // Treeifyウィンドウの左端が画面左端に近くないと発動しない点に注意。
      // 逆に言うと、Treeifyウィンドウが画面左端にぴったりくっついていなくても割とルーズに発動してくれる。
      if (event.screenX + event.movementX <= 0 && event.movementX < 0) {
        External.instance.shouldFloatingLeftSidebarShown = true
        Rerenderer.instance.rerender()
      }
    } else {
      const leftSidebar = document.querySelector('.left-sidebar')
      assertNonNull(leftSidebar)
      if (event.x > leftSidebar.getBoundingClientRect().right) {
        // mouseleaveイベントを使わない理由は、Treeifyウィンドウが画面左端にぴったりくっついていない状況で、
        // マウスを画面左端に動かしたときに左サイドバーが閉じられてしまうことを防ぐため。
        External.instance.shouldFloatingLeftSidebarShown = false
        Rerenderer.instance.rerender()
      }
    }
  })
}

function onResize() {
  doAsyncWithErrorCapture(async () => {
    // 左サイドバーの表示形態を変更する必要がある場合のために再描画する
    Rerenderer.instance.rerender()

    if (await TreeifyWindow.isDualWindowMode()) {
      TreeifyWindow.writeNarrowWidth(innerWidth)
    }
  })
}

async function getLastFocusedWindowId(): Promise<integer> {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused((window) => resolve(window.id))
  })
}
