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
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
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
export async function restart(state: State, skipTabMigration: boolean = false) {
  if (State.isValid(state)) {
    if (!skipTabMigration) {
      await migrateTabs(state)
    }

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
async function migrateTabs(newState: State) {
  // newStateにおけるグローバル項目IDから項目IDへのMapを作る
  const globalItemIdMap = new Map<string, ItemId>()
  for (const itemsKey in newState.items) {
    globalItemIdMap.set(newState.items[itemsKey].globalItemId, parseInt(itemsKey))
  }

  const allItemIds = External.instance.tabItemCorrespondence.getAllItemIds()
  const promises = allItemIds.map(async (itemId) => {
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
    assertNonUndefined(tabId)
    const newItemId = globalItemIdMap.get(Internal.instance.state.items[itemId].globalItemId)
    if (newItemId === undefined) {
      // newStateで対応項目が削除されていた場合
      await chrome.tabs.remove(tabId)
    } else {
      const newUrl = newState.webPageItems[newItemId].url
      if (newUrl !== Internal.instance.state.webPageItems[itemId].url) {
        // newStateでURLが変わっていた場合
        await chrome.tabs.update(tabId, {url: newUrl})
      }
    }
  })
  await Promise.all(promises)
}

function onMutateState(propertyPath: PropertyPath) {
  External.instance.onMutateState(propertyPath)
  Rerenderer.instance.onMutateState(propertyPath)
}

function onClickContextMenu(info: OnClickData) {
  if (info.menuItemId !== 'treeify') return

  // APIの都合上どのタブから来たデータなのかよくわからないので、URLの一致するタブを探す。
  const webPageItemId = findCorrespondWebPageItem(info.pageUrl)
  if (webPageItemId === undefined) return

  const tabTitle = Internal.instance.state.webPageItems[webPageItemId].tabTitle

  if (info.mediaType === 'image' && info.srcUrl !== undefined) {
    // 画像項目として取り込む
    const newItemId = CurrentState.createImageItem()
    CurrentState.setImageItemUrl(newItemId, info.srcUrl)

    // 出典を設定
    CurrentState.setCite(newItemId, {title: tabTitle, url: info.pageUrl})

    CurrentState.insertLastChildItem(webPageItemId, newItemId)
    Rerenderer.instance.rerender()
  } else if (info.selectionText !== undefined) {
    // テキスト項目として取り込む
    const newItemId = CurrentState.createTextItem()
    CurrentState.setTextItemDomishObjects(newItemId, DomishObject.fromPlainText(info.selectionText))

    // 出典を設定
    CurrentState.setCite(newItemId, {title: tabTitle, url: info.pageUrl})

    CurrentState.insertLastChildItem(webPageItemId, newItemId)
    Rerenderer.instance.rerender()
  }
}

// 指定されたURLのタブに対応するウェブページ項目を探す。
// 複数項目が該当する場合、ターゲット項目のIDを優先的に返す。
function findCorrespondWebPageItem(url: string): ItemId | undefined {
  const tabs = External.instance.tabItemCorrespondence.getTabsByUrl(url)
  const itemIds = tabs
    .filter((tab) => tab.id !== undefined)
    .map((tab) => External.instance.tabItemCorrespondence.getItemIdBy(tab.id!))
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (itemIds.contains(targetItemId)) {
    return targetItemId
  }

  return itemIds.find((itemId) => itemId !== undefined)
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
