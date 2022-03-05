import dayjs from 'dayjs'
import { ItemId } from 'src/TreeifyTab/basicType'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onReplaced,
  onUpdated,
  onWindowFocusChanged,
} from 'src/TreeifyTab/External/chromeEventListeners'
import { External } from 'src/TreeifyTab/External/External'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { GoogleDrive } from 'src/TreeifyTab/Internal/GoogleDrive'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { getGoogleDriveSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { ShowMessage } from 'src/Utility/Debug/error'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'
import OnClickData = chrome.contextMenus.OnClickData
import IdleState = chrome.idle.IdleState

export async function startup(initialState: State) {
  External.instance.lastFocusedWindowId = await getLastFocusedWindowId()

  Internal.initialize(initialState)
  Internal.instance.addOnMutateListener(onMutateState)

  // Treeifyタブ起動時点で既に存在するタブをウェブページ項目と紐付ける
  await matchTabsAndWebPageItems()

  Rerenderer.instance.renderForFirstTime()

  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onUnhandledRejection)

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)
  chrome.tabs.onReplaced.addListener(onReplaced)

  chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
  chrome.contextMenus.onClicked.addListener(onClickContextMenu)
  chrome.commands.onCommand.addListener(onCommand)
  chrome.idle.onStateChanged.addListener(onIdleStateChanged)
  // idle状態と判定するまでの時間を50分に設定する。
  // 60分休憩を早めに切り上げた場合にも確実に発動させるために50分を採用した。
  chrome.idle.setDetectionInterval(50 * 60)

  window.addEventListener('online', onOnline)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('online', onOnline)

  chrome.idle.onStateChanged.removeListener(onIdleStateChanged)
  chrome.commands.onCommand.removeListener(onCommand)
  chrome.contextMenus.onClicked.removeListener(onClickContextMenu)
  chrome.windows.onFocusChanged.removeListener(onWindowFocusChanged)

  chrome.tabs.onReplaced.removeListener(onReplaced)
  chrome.tabs.onActivated.removeListener(onActivated)
  chrome.tabs.onRemoved.removeListener(onRemoved)
  chrome.tabs.onUpdated.removeListener(onUpdated)
  chrome.tabs.onCreated.removeListener(onCreated)

  chrome.runtime.onMessage.removeListener(onMessage)

  window.removeEventListener('unhandledrejection', onUnhandledRejection)
  window.removeEventListener('error', onError)

  Internal.cleanup()
  External.cleanup()

  const spaRoot = document.querySelector('#spa-root')
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

    await cleanup()

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
  const globalItemIdMap = new Map<GlobalItemId, ItemId>()
  for (const itemsKey in newState.items) {
    globalItemIdMap.set(newState.items[itemsKey].globalItemId, Number(itemsKey))
  }

  const allItemIds = External.instance.tabItemCorrespondence.getAllItemIds()
  const promises = allItemIds.map(async (itemId) => {
    const tabId = External.instance.tabItemCorrespondence.getTabId(itemId)
    assertNonUndefined(tabId)
    const newItemId = globalItemIdMap.get(Internal.instance.state.items[itemId].globalItemId)
    if (newItemId === undefined) {
      // newStateで対応項目が削除されていた場合、タブを強制的に閉じる
      await External.instance.forceCloseTab(tabId)
    } else {
      const newUrl = newState.webPageItems[newItemId].url
      if (newUrl !== Internal.instance.state.webPageItems[itemId].url) {
        // newStateでURLが変わっていた場合
        await chrome.tabs.update(tabId, { url: newUrl })
      }
    }
  })
  await Promise.all(promises)
}

function onMutateState(statePath: StatePath) {
  External.instance.onMutateState(statePath)
  Rerenderer.instance.onMutateState(statePath)
}

async function onClickContextMenu(info: OnClickData) {
  if (info.menuItemId !== 'treeify') return

  // APIの都合上どのタブから来たデータなのかよくわからないので、URLの一致するタブを探す。
  const webPageItemId = findCorrespondWebPageItem(info.pageUrl)
  if (webPageItemId === undefined) return

  const targetItemPath = CurrentState.getTargetItemPath()
  const tabTitle = Internal.instance.state.webPageItems[webPageItemId].tabTitle

  if (info.mediaType === 'image' && info.srcUrl !== undefined) {
    // 画像項目として取り込む
    const newItemId = CurrentState.createImageItem()
    CurrentState.setImageItemUrl(newItemId, info.srcUrl)

    // 出典を設定
    CurrentState.setSource(newItemId, { title: tabTitle, url: info.pageUrl })

    CurrentState.insertFirstChildItem(webPageItemId, newItemId)
    if (webPageItemId === ItemPath.getItemId(targetItemPath)) {
      const newItemPath = RArray$.append(newItemId)(targetItemPath)
      CurrentState.setTargetItemPath(newItemPath)
      CurrentState.revealItemPath(newItemPath)
    }
    Rerenderer.instance.rerender()
    TreeifyTab.open()
  } else if (info.selectionText !== undefined) {
    // Treeifyタブが最前面でないとクリップボードからの読み込みがエラーになるので先に最前面化する
    await TreeifyTab.open()

    const text = await call(async () => {
      if (Internal.instance.state.useClipboardTextWhenQuoting) {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' } as any)
        if (permission.state !== 'denied') {
          const clipboardText = await navigator.clipboard.readText()
          if (clipboardText.trim().replaceAll(/\r?\n/g, ' ') === info.selectionText) {
            return clipboardText.trim()
          }
        }
      }
      return info.selectionText
    })
    assertNonUndefined(text)

    // テキスト項目として取り込む
    const newItemId = CurrentState.createTextItem()
    CurrentState.setTextItemDomishObjects(newItemId, DomishObject.fromPlainText(text))

    // 出典を設定
    CurrentState.setSource(newItemId, { title: tabTitle, url: info.pageUrl })

    CurrentState.insertFirstChildItem(webPageItemId, newItemId)
    if (webPageItemId === ItemPath.getItemId(targetItemPath)) {
      const newItemPath = RArray$.append(newItemId)(targetItemPath)
      CurrentState.setTargetItemPath(newItemPath)
      CurrentState.revealItemPath(newItemPath)
    }
    Rerenderer.instance.rerender()
  }
}

// 指定されたURLのタブに対応するウェブページ項目を探す。
// 複数項目が該当する場合、ターゲット項目のIDを優先的に返す。
function findCorrespondWebPageItem(url: string): ItemId | undefined {
  const tabs = External.instance.tabItemCorrespondence.getTabsByUrl(url)
  const itemIds = tabs
    .filter((tab) => tab.id !== undefined)
    .map((tab) => External.instance.tabItemCorrespondence.getItemId(tab.id!))
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (itemIds.includes(targetItemId)) {
    return targetItemId
  }

  return itemIds.find((itemId) => itemId !== undefined)
}

async function onCommand(commandName: string) {
  call(async () => {
    switch (commandName) {
      case 'show-treeify-tab':
        await TreeifyTab.open()
        break
      case 'close-tab-and-show-treeify-tab':
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id !== undefined) {
          chrome.tabs.remove(tab.id)
        }
        await TreeifyTab.open()
        break
    }
  })
}

async function onIdleStateChanged(idleState: IdleState) {
  if (idleState !== 'active') return

  console.log(
    'onIdleState active',
    'window.navigator.onLine =',
    window.navigator.onLine,
    dayjs().format('MM/DD HH:mm:ss')
  )

  await startAutoSync()
}

async function getLastFocusedWindowId(): Promise<integer> {
  const window = await chrome.windows.getLastFocused()
  assertNonUndefined(window.id)
  return window.id
}

function onError(event: ErrorEvent) {
  if (event.error instanceof Error) {
    handleErrorEvent(event.error, event)
  }
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  if (event.reason instanceof Error) {
    handleErrorEvent(event.reason, event)
  }
}

function handleErrorEvent(error: Error, event: Event) {
  if (error instanceof ShowMessage) {
    alert(error.message)
    event.preventDefault()
  } else if (error.stack !== undefined) {
    alert(error.stack)
  } else {
    alert(error)
  }
}

async function onOnline() {
  console.log('onOnline', dayjs().format('MM/DD HH:mm:ss'))
  await startAutoSync()
}

export async function startAutoSync() {
  const syncedAt = getGoogleDriveSyncedAt()
  if (syncedAt === undefined) return

  External.instance.isInSync = true
  Rerenderer.instance.rerender()
  try {
    const metaData = await GoogleDrive.fetchDataFileMetaData()
    if (metaData === undefined) {
      External.instance.hasSyncIssue = false
      return
    }

    if (metaData.modifiedTime === syncedAt) {
      External.instance.hasSyncIssue = false
      return
    }

    await GoogleDrive.syncWithGoogleDrive(metaData)
  } catch {
    console.log('リトライ', dayjs().format('MM/DD HH:mm:ss'))

    try {
      // 特に自動同期がオフラインでエラーになる不具合の対策として、API呼び出しをリトライする
      const metaData = await GoogleDrive.fetchDataFileMetaData()
      if (metaData === undefined) {
        External.instance.hasSyncIssue = false
        return
      }

      if (metaData.modifiedTime === syncedAt) {
        External.instance.hasSyncIssue = false
        return
      }

      await GoogleDrive.syncWithGoogleDrive(metaData)
    } catch (error) {
      console.error(error)
      External.instance.hasSyncIssue = true
    }
  } finally {
    External.instance.isInSync = false
    Rerenderer.instance.rerender()
  }
}
