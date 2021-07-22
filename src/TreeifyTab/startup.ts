import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyTab/basicType'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
  onWindowFocusChanged,
} from 'src/TreeifyTab/External/chromeEventListeners'
import {External} from 'src/TreeifyTab/External/External'
import {Chunk} from 'src/TreeifyTab/Internal/Chunk'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Database} from 'src/TreeifyTab/Internal/Database'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {TreeifyTab} from 'src/TreeifyTab/TreeifyTab'
import OnClickData = chrome.contextMenus.OnClickData

export async function startup(initialState: State) {
  External.instance.lastFocusedWindowId = await getLastFocusedWindowId()

  Internal.initialize(initialState)
  Internal.instance.addOnMutateListener(onMutateState)

  // Treeifyタブ起動時点で既に存在するタブをウェブページ項目と紐付ける
  await matchTabsAndWebPageItems()

  Rerenderer.instance.renderForFirstTime()

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)

  chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)

  chrome.contextMenus.onClicked.addListener(onClickContextMenu)

  chrome.commands.onCommand.addListener(onCommand)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  chrome.commands.onCommand.removeListener(onCommand)

  chrome.contextMenus.onClicked.removeListener(onClickContextMenu)

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

/**
 * 事実上の再起動を行う（ただしStateがinvalidだった場合は行わない）。
 * 実際にページをリロードするわけではないが、全てのシングルトンやグローバル変数に対して
 * 必要に応じてリセット処理を行う。
 * DOMの状態もリセットされ、初回描画からやり直される。
 */
export async function restart(state: State) {
  if (State.isValid(state)) {
    migrateTabs(state)

    const dataFolder = External.instance.dataFolder
    await cleanup()
    // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
    External.instance.dataFolder = dataFolder

    // IndexedDBを新しいStateと一致するよう更新
    await Database.clearAllChunks()
    // IndexedDBは基本的にwrite-onlyなので書き込み完了を待つ必要はない
    Database.writeChunks(Chunk.createAllChunks(state))

    await startup(state)
  }
}

// タブの状態を新しいStateに合わせる。
// 具体的には、新しいStateで対応項目が削除されていた場合はタブを閉じる。
// また、新しいStateでURLが変わっていたらタブのURLを更新する。
function migrateTabs(newState: State) {
  // newStateにおけるグローバル項目IDから項目IDへのMapを作る
  const globalItemIdMap = new Map<string, ItemId>()
  for (const itemsKey in newState.items) {
    const item = newState.items[itemsKey]
    const globalItemId = `${item.instance}:${item.iisn}`
    globalItemIdMap.set(globalItemId, parseInt(itemsKey))
  }

  for (const itemId of External.instance.tabItemCorrespondence.getAllItemIds()) {
    const item = Internal.instance.state.items[itemId]
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
    assertNonUndefined(tabId)
    const globalItemId = `${item.instance}:${item.iisn}`
    const newItemId = globalItemIdMap.get(globalItemId)
    if (newItemId === undefined) {
      // newStateで対応項目が削除されていた場合
      chrome.tabs.remove(tabId)
    } else {
      const newUrl = newState.webPageItems[newItemId].url
      if (newUrl !== Internal.instance.state.webPageItems[itemId].url) {
        // newStateでURLが変わっていた場合
        chrome.tabs.update(tabId, {url: newUrl})
      }
    }
  }
}

function onMutateState(propertyPath: PropertyPath) {
  External.instance.onMutateState(propertyPath)
  Rerenderer.instance.onMutateState(propertyPath)
}

function onClickContextMenu(info: OnClickData) {
  if (info.menuItemId !== 'treeify') return

  // APIの都合上どのタブから来たデータなのかよくわからないので、URLの一致するタブを探す。
  const tabs = External.instance.tabItemCorrespondence.getTabsByUrl(info.pageUrl)
  const tab = tabs.first(undefined)
  if (tab === undefined) return

  const itemId =
    tab.id !== undefined ? External.instance.tabItemCorrespondence.getItemIdBy(tab.id) : undefined
  if (itemId === undefined) return

  if (info.mediaType === 'image' && info.srcUrl !== undefined) {
    // 画像項目として取り込む
    const newItemId = CurrentState.createImageItem()
    CurrentState.setImageItemUrl(newItemId, info.srcUrl)

    // 出典を設定
    CurrentState.setCite(newItemId, {title: tab.title ?? '', url: info.pageUrl})

    CurrentState.insertLastChildItem(itemId, newItemId)
    Rerenderer.instance.rerender()
  } else if (info.selectionText !== undefined) {
    // テキスト項目として取り込む
    const newItemId = CurrentState.createTextItem()
    CurrentState.setTextItemDomishObjects(newItemId, DomishObject.fromPlainText(info.selectionText))

    // 出典を設定
    CurrentState.setCite(newItemId, {title: tab.title ?? '', url: info.pageUrl})

    CurrentState.insertLastChildItem(itemId, newItemId)
    Rerenderer.instance.rerender()
  }
}

async function onCommand(commandName: string) {
  switch (commandName) {
    case 'show-treeify-tab':
      TreeifyTab.open()
      break
    case 'close-tab-and-show-treeify-tab':
      TreeifyTab.open()
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
      if (tab.id !== undefined) {
        chrome.tabs.remove(tab.id)
      }
      break
  }
}

async function getLastFocusedWindowId(): Promise<integer> {
  const window = await chrome.windows.getLastFocused()
  // TODO: assertしていい理由が特にない
  assertNonUndefined(window.id)
  return window.id
}
