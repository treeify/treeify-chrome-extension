import MessageSender = chrome.runtime.MessageSender
import Tab = chrome.tabs.Tab
import TabActiveInfo = chrome.tabs.TabActiveInfo
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {doAsyncWithErrorCapture, doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import UAParser from 'ua-parser-js'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  doWithErrorCapture(() => {
    switch (message.type) {
      case 'OnMouseMoveToLeftEnd':
        OnMouseMoveToLeftEnd()
        break
      case 'OnMouseEnter':
        // Macではフォーカスを持っていないウィンドウの操作に一手間かかるので、マウスが乗った時点でフォーカスする
        // TODO: Windowsでもdocument.visibilityState === 'visible'の条件付きなら実行していいんじゃないか？
        if (new UAParser().getOS().name === 'Mac OS') {
          assertNonUndefined(sender.tab?.windowId)

          const isInTreeifyWindow =
            Math.max(screenX, message.x) <= Math.min(screenX + innerWidth, message.x) &&
            Math.max(screenY, message.y) <= Math.min(screenY + innerHeight, message.y)

          if (
            !isInTreeifyWindow &&
            External.instance.lastFocusedWindowId !== chrome.windows.WINDOW_ID_NONE
          ) {
            chrome.windows.update(sender.tab.windowId, {focused: true})
          }
        }
        break
      // TODO: 網羅性チェックをしていない理由はなんだろう？
    }
  })
}

export function onCreated(tab: Tab) {
  doWithErrorCapture(() => {
    // もしこうなるケースがあるならきちんと対応を考えたいのでエラーにする
    assertNonUndefined(tab.id)

    const url = tab.url || tab.pendingUrl || ''
    const itemIdsForTabCreation = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
    if (itemIdsForTabCreation.isEmpty()) {
      // タブに対応するウェブページアイテムがない時

      // ウェブページアイテムを作る
      const newWebPageItemId = CurrentState.createWebPageItem()
      reflectInWebPageItem(newWebPageItemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, newWebPageItemId)

      // タブがバックグラウンドで開かれたら未読フラグを立てる
      if (!tab.active || tab.windowId !== External.instance.lastFocusedWindowId) {
        CurrentState.setIsUnreadFlag(newWebPageItemId, true)
      }

      const targetItemPath = CurrentState.getTargetItemPath()
      const targetItemId = ItemPath.getItemId(targetItemPath)

      if (url === 'chrome://newtab/' || tab.openerTabId === undefined) {
        const newItemPath = CurrentState.insertBelowItem(targetItemPath, newWebPageItemId)
        if (tab.active) {
          CurrentState.setTargetItemPath(newItemPath)
        }
      } else {
        const openerItemId = External.instance.tabItemCorrespondence.getItemIdBy(tab.openerTabId)
        assertNonUndefined(openerItemId)

        // openerの最後の子として追加する
        CurrentState.insertLastChildItem(openerItemId, newWebPageItemId)

        // openerがターゲットアイテムなら
        if (targetItemId === openerItemId) {
          // フォーカスを移す
          if (tab.active) {
            const newItemPath = targetItemPath.push(newWebPageItemId)
            CurrentState.setTargetItemPath(newItemPath)
          }
        }
      }
    } else {
      // 既存のウェブページアイテムに対応するタブが開かれた時

      const itemId = itemIdsForTabCreation.first(undefined)
      assertNonUndefined(itemId)
      reflectInWebPageItem(itemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, itemId)
      External.instance.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())

      // タブがバックグラウンドで開かれたら未読フラグを立てる
      if (!tab.active || tab.windowId !== External.instance.lastFocusedWindowId) {
        CurrentState.setIsUnreadFlag(itemId, true)
      }
    }

    Rerenderer.instance.rerender()
  })
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  doAsyncWithErrorCapture(async () => {
    // Treeifyウィンドウのタブだった場合は何もしない。
    // 例えばdocument.titleを変更した際にonUpdatedイベントが発生する。
    if (tab.url === chrome.runtime.getURL('TreeifyWindow/index.html')) return

    if (changeInfo.discarded) {
      // discardされたらタブIDが変わるのでアイテムIDとの対応関係を修正する
      // TODO: ↓は手抜き実装。最適化の余地あり
      await matchTabsAndWebPageItems()
    }

    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
    assertNonUndefined(itemId)
    reflectInWebPageItem(itemId, tab)

    Rerenderer.instance.rerender()
  })
}

// Tabの情報をウェブページアイテムに転写する
function reflectInWebPageItem(itemId: ItemId, tab: Tab) {
  if (tab.id !== undefined) {
    External.instance.tabItemCorrespondence.registerTab(tab.id, tab)
  }
  CurrentState.setWebPageItemTabTitle(itemId, tab.title ?? '')
  const url = tab.url || tab.pendingUrl || ''
  CurrentState.setWebPageItemUrl(itemId, url)
  CurrentState.setWebPageItemFaviconUrl(itemId, tab.favIconUrl ?? '')
}

export async function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  doWithErrorCapture(() => {
    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
    // アイテム削除に伴ってTreeifyが対応タブを閉じた場合はundefinedになる
    if (itemId === undefined) return

    External.instance.tabItemCorrespondence.untieTabAndItemByTabId(tabId)

    if (External.instance.hardUnloadedTabIds.has(tabId)) {
      // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムは削除しない
      External.instance.hardUnloadedTabIds.delete(tabId)
    } else if (CurrentState.isItem(itemId)) {
      // 対応するウェブページアイテムを削除する
      CurrentState.deleteItemItself(itemId)
      // TODO: targetItemPathがダングリングポインタになる不具合がある
    }

    Rerenderer.instance.rerender()
  })
}

export async function onActivated(tabActiveInfo: TabActiveInfo) {
  doWithErrorCapture(() => {
    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabActiveInfo.tabId)
    if (itemId !== undefined) {
      CurrentState.updateItemTimestamp(itemId)
      CurrentState.setIsUnreadFlag(itemId, false)

      // もしタブに対応するアイテムがアクティブページに所属していれば、それをターゲットする
      const activePageId = CurrentState.getActivePageId()
      for (const itemPath of CurrentState.yieldItemPaths(itemId)) {
        if (ItemPath.getRootItemId(itemPath) === activePageId && CurrentState.isVisible(itemPath)) {
          CurrentState.setTargetItemPath(itemPath)
          break
        }
      }

      Rerenderer.instance.rerender()
    }
  })
}

function OnMouseMoveToLeftEnd() {
  // Treeifyウィンドウを最前面化する
  // TODO: 誤差だろうけれど最適化の余地が一応ある
  TreeifyWindow.open()
}

/**
 * 既存のタブとウェブページアイテムのマッチングを行う。
 * URLが完全一致しているかどうかで判定する。
 */
export async function matchTabsAndWebPageItems() {
  // KeyはURL、ValueはそのURLを持つアイテムID
  const urlToItemIds = new Map<string, List<ItemId>>()

  const webPageItems = Internal.instance.state.webPageItems
  for (const key in webPageItems) {
    const itemId = parseInt(key)
    const url = webPageItems[itemId].url
    urlToItemIds.set(url, (urlToItemIds.get(url) ?? List.of()).push(itemId))
  }

  for (const tab of await getAllNormalTabs()) {
    assertNonUndefined(tab.id)

    const url = tab.pendingUrl ?? tab.url ?? ''
    const webPageItemIds = urlToItemIds.get(url)
    if (webPageItemIds === undefined) {
      // URLの一致するウェブページアイテムがない場合、
      // ウェブページアイテムを作る
      const newWebPageItemId = CurrentState.createWebPageItem()
      reflectInWebPageItem(newWebPageItemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, newWebPageItemId)

      // アクティブページの最初の子として追加する
      const activePageId = CurrentState.getActivePageId()
      CurrentState.insertFirstChildItem(activePageId, newWebPageItemId)
    } else {
      // URLの一致するウェブページアイテムがある場合
      const itemId: ItemId = webPageItemIds.last()

      reflectInWebPageItem(itemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, itemId)
    }
  }
}

// 指定されたURLを持つウェブページアイテムを探す。
// もし複数該当する場合は最初に見つかったものを返す。
// 見つからなかった場合はundefinedを返す。
function findWebPageItemId(url: string): ItemId | undefined {
  const webPageItems = Internal.instance.state.webPageItems
  for (const itemId in webPageItems) {
    const webPageItem = webPageItems[itemId]
    if (url === webPageItem.url) {
      // URLが一致するウェブページアイテムが見つかった場合
      return parseInt(itemId)
    }
  }
  return undefined
}

// 要するにTreeifyウィンドウを除く全ウィンドウの全タブを返す
async function getAllNormalTabs(): Promise<Tab[]> {
  const windows = await chrome.windows.getAll({populate: true, windowTypes: ['normal']})
  return windows.flatMap((window) => window.tabs ?? [])
}

export function onWindowFocusChanged(windowId: integer) {
  doWithErrorCapture(() => {
    External.instance.lastFocusedWindowId = windowId
  })
}
