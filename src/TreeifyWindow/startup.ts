import {State} from 'src/TreeifyWindow/Internal/State'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
} from 'src/TreeifyWindow/External/chromeEventListeners'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {onCopy, onCut, onPaste} from 'src/TreeifyWindow/Internal/importAndExport'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import UAParser from 'ua-parser-js'

export async function startup(initialState: State) {
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

  document.addEventListener('copy', onCopy)
  document.addEventListener('cut', onCut)
  document.addEventListener('paste', onPaste)

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

  document.removeEventListener('paste', onPaste)
  document.removeEventListener('cut', onCut)
  document.removeEventListener('copy', onCopy)

  chrome.tabs.onCreated.removeListener(onCreated)
  chrome.tabs.onUpdated.removeListener(onUpdated)
  chrome.tabs.onRemoved.removeListener(onRemoved)
  chrome.tabs.onActivated.removeListener(onActivated)

  chrome.runtime.onMessage.removeListener(onMessage)

  Internal.cleanup()
  External.cleanup()
}

function onStateChange(newState: State, mutatedPropertyPaths: Set<PropertyPath>) {
  External.instance.rerender(newState)
  External.instance.requestWriteDataFolder(newState, mutatedPropertyPaths)
}

function onMouseMove(event: MouseEvent) {
  // マウスカーソルがTreeifyウィンドウ左端かつ画面左端に到達したとき。
  // この条件を満たすにはウィンドウが最大化状態であるか、ディスプレイの左端にぴったりくっついていないといけない。
  if (event.clientX === 0 && event.screenX === 0 && event.movementX < 0) {
    CurrentState.setIsFloatingLeftSidebarShown(true)
    CurrentState.commit()
  }
}

function onMouseEnter() {
  // Macではフォーカスを持っていないウィンドウの操作に一手間かかるので、マウスが乗った時点でフォーカスする
  if (new UAParser().getOS().name === 'Mac OS') {
    TreeifyWindow.open()
  }
}

function onResize() {
  // 左サイドバーの表示形態を変更する必要があるかもしれないので再描画する
  CurrentState.commit()
}
