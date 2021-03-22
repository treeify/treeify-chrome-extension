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
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {
  createItemFromSingleLineText,
  detectUrl,
  pasteMultilineText,
} from 'src/TreeifyWindow/Internal/importAndExport'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

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

  window.addEventListener('resize', onResize)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('resize', onResize)

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

function onCopy(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  const textSelection = getTextItemSelectionFromDom()
  if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
    // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
    event.preventDefault()
    const contentText = NextState.exportAsIndentedText(
      ItemPath.getItemId(NextState.getTargetItemPath())
    )
    event.clipboardData.setData('text/plain', contentText)
  }
}

function onCut(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  const textSelection = getTextItemSelectionFromDom()
  if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
    // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
    event.preventDefault()
    const contentText = NextState.exportAsIndentedText(
      ItemPath.getItemId(NextState.getTargetItemPath())
    )
    event.clipboardData.setData('text/plain', contentText)

    NullaryCommand.deleteItem()
    NextState.commit()
  }
}

// ペースト時にプレーンテキスト化する
function onPaste(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  event.preventDefault()
  const text = event.clipboardData.getData('text/plain')
  if (!text.includes('\n')) {
    // 1行だけのテキストの場合

    const url = detectUrl(text)
    if (url !== undefined) {
      // URLを含むなら
      const newItemId = createItemFromSingleLineText(text)
      NextState.insertNextSiblingItem(NextState.getTargetItemPath(), newItemId)
      NextState.commit()
    } else {
      document.execCommand('insertText', false, text)
    }
  } else {
    // 複数行にわたるテキストの場合
    pasteMultilineText(text)
  }
}

function onMouseMove(event: MouseEvent) {
  // マウスカーソルがTreeifyウィンドウ左端かつ画面左端に到達したとき。
  // この条件を満たすにはウィンドウが最大化状態であるか、ディスプレイの左端にぴったりくっついていないといけない。
  if (event.clientX === 0 && event.screenX === 0 && event.movementX < 0) {
    NextState.setIsFloatingLeftSidebarShown(true)
    NextState.commit()
  }
}

function onResize() {
  // window.outerWidthを使うとウィンドウ最大化および最大化解除時に実態と異なる値になる（Macで確認済み）
  NextState.setTreeifyWindowWidth(window.innerWidth)
  NextState.commit()
}
