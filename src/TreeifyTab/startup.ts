import dayjs from 'dayjs'
import { ItemId } from 'src/TreeifyTab/basicType'
import {
  matchTabsAndWebPageItems,
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
  onWindowFocusChanged,
} from 'src/TreeifyTab/External/chromeEventListeners'
import { External } from 'src/TreeifyTab/External/External'
import { GoogleDrive } from 'src/TreeifyTab/External/GoogleDrive'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { extractPlainText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { ReminderSetting, State } from 'src/TreeifyTab/Internal/State'
import { getSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { decompress } from 'src/Utility/gzip'
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

  chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
  chrome.contextMenus.onClicked.addListener(onClickContextMenu)
  chrome.commands.onCommand.addListener(onCommand)
  if (process.env.NODE_ENV !== 'prod') {
    chrome.alarms.onAlarm.addListener(onAlarm)
  }
  chrome.idle.onStateChanged.addListener(onIdleStateChanged)
  // idle状態と判定するまでの時間を60分に設定する。
  // デフォルトは1分なので無駄なAPI呼び出しが起こる懸念がある。
  chrome.idle.setDetectionInterval(60 * 60)

  window.addEventListener('online', onOnline)

  if (process.env.NODE_ENV !== 'prod') {
    await CurrentState.setupAllAlarms()
  }
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('online', onOnline)

  chrome.idle.onStateChanged.removeListener(onIdleStateChanged)
  if (process.env.NODE_ENV !== 'prod') {
    chrome.alarms.onAlarm.removeListener(onAlarm)
  }
  chrome.commands.onCommand.removeListener(onCommand)
  chrome.contextMenus.onClicked.removeListener(onClickContextMenu)
  chrome.windows.onFocusChanged.removeListener(onWindowFocusChanged)

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
  const globalItemIdMap = new Map<GlobalItemId, ItemId>()
  for (const itemsKey in newState.items) {
    globalItemIdMap.set(newState.items[itemsKey].globalItemId, Number(itemsKey))
  }

  const allItemIds = External.instance.tabItemCorrespondence.getAllItemIds()
  const promises = allItemIds.map(async (itemId) => {
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
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

function onMutateState(propertyPath: PropertyPath) {
  External.instance.onMutateState(propertyPath)
  Rerenderer.instance.onMutateState(propertyPath)
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
      CurrentState.moses(newItemPath)
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
      CurrentState.moses(newItemPath)
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
    .map((tab) => External.instance.tabItemCorrespondence.getItemIdBy(tab.id!))
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
        TreeifyTab.open()
        break
      case 'close-tab-and-show-treeify-tab':
        await TreeifyTab.open()
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id !== undefined) {
          chrome.tabs.remove(tab.id)
        }
        break
    }
  })
}

async function onAlarm(alarm: Alarm) {
  const [itemId, index] = alarm.name.split('#').map(Number)
  const reminderSettings = Internal.instance.state.reminders[itemId]
  const reminderSetting = reminderSettings[index]
  assertNonUndefined(reminderSetting)
  Internal.instance.mutate(
    RArray$.updateAt<ReminderSetting>(index, {
      ...reminderSetting,
      notifiedAt: alarm.scheduledTime,
    })(reminderSettings),
    PropertyPath.of('reminders', itemId)
  )
  await CurrentState.setupAllAlarms()

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const notification = new Notification(
    `Treeifyリマインダー（${createDateTimeText(reminderSetting)}）`,
    { body: extractPlainText(itemId) }
  )
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

function createDateTimeText(reminderSetting: ReminderSetting): string {
  switch (reminderSetting.type) {
    case 'once':
      return dayjs()
        .year(reminderSetting.year)
        .month(reminderSetting.month)
        .date(reminderSetting.date)
        .hour(reminderSetting.hour)
        .minute(reminderSetting.minute)
        .format('YYYY-MM-DD HH:mm')
    case 'every month':
      return dayjs()
        .date(reminderSetting.date)
        .hour(reminderSetting.hour)
        .minute(reminderSetting.minute)
        .format('毎月D日 HH:mm')
  }
}

async function onIdleStateChanged(idleState: IdleState) {
  if (idleState !== 'active') return

  if (!window.navigator.onLine) return

  await prefetchDataFile()
}

async function getLastFocusedWindowId(): Promise<integer> {
  const window = await chrome.windows.getLastFocused()
  assertNonUndefined(window.id)
  return window.id
}

function onError(event: ErrorEvent) {
  if (event.error instanceof Error) {
    handleError(event.error)
  }
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  if (event.reason instanceof Error) {
    handleError(event.reason)
  }
}

function handleError(error: Error) {
  if (error.stack !== undefined) {
    alert(error.stack)
  } else {
    alert(error)
  }
}

async function onOnline() {
  console.log('onOnline', new Date().toLocaleDateString(), new Date().toLocaleTimeString())

  await prefetchDataFile()
}

// データファイルをバックグラウンドで自動ダウンロードするための仕組み
async function prefetchDataFile() {
  if (Internal.instance.state.syncWith === 'Google Drive') {
    const syncedAt = getSyncedAt(Internal.instance.state.syncWith)
    if (syncedAt === undefined) return

    const metaData = await GoogleDrive.fetchDataFileMetaData()
    if (metaData === undefined) return

    External.instance.backgroundDownload = {
      modifiedTime: metaData.modifiedTime,
      promise: call(async () => {
        const response = await GoogleDrive.readFile(metaData.id)
        const text = await decompress(await response.arrayBuffer())
        const state: State = JSON.parse(text)
        return state
      }),
    }
  }
}
