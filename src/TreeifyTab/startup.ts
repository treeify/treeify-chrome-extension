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
import { extractPlainText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Reminder, State } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { getSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { ShowMessage } from 'src/Utility/Debug/error'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'
import Alarm = chrome.alarms.Alarm
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
  if (process.env.NODE_ENV !== 'production') {
    chrome.alarms.onAlarm.addListener(onAlarm)
  }
  chrome.idle.onStateChanged.addListener(onIdleStateChanged)
  // idle状態と判定するまでの時間を50分に設定する。
  // 60分休憩を早めに切り上げた場合にも確実に発動させるために50分を採用した。
  chrome.idle.setDetectionInterval(50 * 60)

  window.addEventListener('online', onOnline)

  if (process.env.NODE_ENV !== 'production') {
    await CurrentState.setupAllAlarms()
  }
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('online', onOnline)

  chrome.idle.onStateChanged.removeListener(onIdleStateChanged)
  if (process.env.NODE_ENV !== 'production') {
    chrome.alarms.onAlarm.removeListener(onAlarm)
  }
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

function onClickContextMenu(info: OnClickData) {
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
    // テキスト項目として取り込む
    const newItemId = CurrentState.createTextItem()
    CurrentState.setTextItemDomishObjects(newItemId, DomishObject.fromPlainText(info.selectionText))

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

async function onAlarm(alarm: Alarm) {
  const itemId = Number(alarm.name)
  const reminder = Internal.instance.state.reminders[itemId]
  assertNonUndefined(reminder)
  Internal.instance.mutate(
    {
      ...reminder,
      notifiedAt: alarm.scheduledTime,
    },
    StatePath.of('reminders', itemId)
  )
  await CurrentState.setupAllAlarms()

  const notification = new Notification(`Treeifyリマインダー（${createDateTimeText(reminder)}）`, {
    body: extractPlainText(itemId),
    requireInteraction: true,
  })
  // 通知のクリック時は該当項目にジャンプする
  notification.onclick = async () => {
    // TODO: ページツリーに含まれるものを優先する。その中でも足跡ランクの高いものを優先したい
    const itemPath = Array.from(CurrentState.yieldItemPaths(itemId))[0]
    assertNonUndefined(itemPath)
    CurrentState.jumpTo(itemPath)
    Rerenderer.instance.rerender()
    await TreeifyTab.open()
  }
}

function createDateTimeText(reminder: Reminder): string {
  switch (reminder.type) {
    case 'Once':
      return dayjs()
        .year(reminder.year)
        .month(reminder.month)
        .date(reminder.date)
        .hour(reminder.hour)
        .minute(reminder.minute)
        .format('YYYY-MM-DD HH:mm')
    case 'EveryMonth':
      return dayjs()
        .date(reminder.date)
        .hour(reminder.hour)
        .minute(reminder.minute)
        .format('毎月D日 HH:mm')
  }
}

async function onIdleStateChanged(idleState: IdleState) {
  if (idleState !== 'active') return

  console.log(
    'onIdleState active',
    'window.navigator.onLine =',
    window.navigator.onLine,
    dayjs().format('MM/DD HH:mm:ss')
  )

  if (!window.navigator.onLine) return

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
  const syncedAt = getSyncedAt()
  if (syncedAt === undefined) return

  External.instance.isInSync = true
  Rerenderer.instance.rerender()
  try {
    const metaData = await GoogleDrive.fetchDataFileMetaData()
    if (metaData === undefined) return

    if (metaData.modifiedTime === syncedAt) return

    await GoogleDrive.syncWithGoogleDrive(metaData)
  } finally {
    External.instance.isInSync = false
    Rerenderer.instance.rerender()
  }
}
