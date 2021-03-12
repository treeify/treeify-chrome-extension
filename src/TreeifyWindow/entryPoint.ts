import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
} from 'src/TreeifyWindow/External/chromeEventListeners'
import {External} from 'src/TreeifyWindow/External/External'

entryPoint()

async function entryPoint() {
  // Treeifyウィンドウ起動時点で既に存在するタブをウェブページアイテムと紐付ける
  await matchTabsAndWebPageItems()

  External.instance.render(Internal.instance.currentState)

  Internal.instance.addStateChangeListener((newState) => {
    External.instance.rerender(newState)
  })

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)

  // テキストアイテム内のキャレット位置の監視用
  document.addEventListener('selectionchange', (event) => {
    NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)
    NextState.commit()
  })
}
