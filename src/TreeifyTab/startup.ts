import {List} from 'immutable'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {doAsyncWithErrorCapture, doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
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
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
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

  // Treeifyタブ起動時点で既に存在するタブをウェブページアイテムと紐付ける
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

  document.addEventListener('mousemove', onMouseMove)

  window.addEventListener('resize', onResize)
}

/** このプログラムが持っているあらゆる状態（グローバル変数やイベントリスナー登録など）を破棄する */
export async function cleanup() {
  // セオリーに則り、初期化時とは逆の順番で処理する

  window.removeEventListener('resize', onResize)

  document.removeEventListener('mousemove', onMouseMove)

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
    const dataFolder = External.instance.dataFolder
    await cleanup()
    // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
    External.instance.dataFolder = dataFolder
    await startup(state)
  }
}

function onMutateState(propertyPath: PropertyPath) {
  External.instance.onMutateState(propertyPath)
}

function onClickContextMenu(info: OnClickData) {
  if (info.menuItemId === 'selection' && info.selectionText !== undefined) {
    // APIの都合上どのタブから来たデータなのかよくわからないので、URLの一致するタブを探す。
    const tabs = External.instance.tabItemCorrespondence.getTabsByUrl(info.pageUrl)
    const tab = tabs.first(undefined)
    assertNonUndefined(tab)

    const itemId =
      tab.id !== undefined ? External.instance.tabItemCorrespondence.getItemIdBy(tab.id) : undefined
    if (itemId !== undefined) {
      const newItemId = CurrentState.createTextItem()
      CurrentState.setTextItemDomishObjects(
        newItemId,
        List.of({
          type: 'text',
          textContent: info.selectionText,
        })
      )

      // 出典を設定
      CurrentState.setCite(newItemId, {title: tab.title ?? '', url: info.pageUrl})

      CurrentState.insertLastChildItem(itemId, newItemId)
      Rerenderer.instance.rerender()
    }
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

function onMouseMove(event: MouseEvent) {
  doWithErrorCapture(() => {
    External.instance.mousePosition = {x: event.clientX, y: event.clientY}

    // マウスの位置と動きに応じて左サイドバーを開閉する
    if (!External.instance.shouldFloatingLeftSidebarShown) {
      const gap = event.screenX - event.clientX
      if (gap > 0) {
        // Treeifyタブ左端と画面左端の間に隙間がある場合

        if (event.screenX + event.movementX <= 0 && event.movementX < 0) {
          External.instance.shouldFloatingLeftSidebarShown = true
        }
      } else {
        // Treeifyタブ左端と画面左端の間に隙間がない場合

        if (event.screenX === 0 && event.movementX === 0) {
          External.instance.shouldFloatingLeftSidebarShown = true
        }
      }
    } else {
      const leftSidebar = document.querySelector('.left-sidebar')
      if (leftSidebar !== null && event.x > leftSidebar.getBoundingClientRect().right) {
        // mouseleaveイベントを使わない理由は、Treeifyタブが画面左端にぴったりくっついていない状況で、
        // マウスを画面左端に動かしたときに左サイドバーが閉じられてしまうことを防ぐため。
        External.instance.shouldFloatingLeftSidebarShown = false
      }
    }

    Rerenderer.instance.rerender()
  })
}

function onResize() {
  doAsyncWithErrorCapture(async () => {
    // 左サイドバーの表示形態を変更する必要がある場合のために再描画する
    Rerenderer.instance.rerender()
  })
}

async function getLastFocusedWindowId(): Promise<integer> {
  const window = await chrome.windows.getLastFocused()
  // TODO: assertしていい理由が特にない
  assertNonUndefined(window.id)
  return window.id
}
