import MessageSender = chrome.runtime.MessageSender
import Tab = chrome.tabs.Tab
import TabActiveInfo = chrome.tabs.TabActiveInfo
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import {List} from 'immutable'
import {integer, ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import UAParser from 'ua-parser-js'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  doWithErrorHandling(() => {
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
  doWithErrorHandling(() => {
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

      const targetItemPath = CurrentState.getTargetItemPath()
      const targetItemId = ItemPath.getItemId(targetItemPath)

      if (url === 'chrome://newtab/' || tab.openerTabId === undefined) {
        if (ItemPath.hasParent(targetItemPath)) {
          // いわゆる「新しいタブ」は弟として追加する
          CurrentState.insertNextSiblingItem(targetItemPath, newWebPageItemId)

          // フォーカスを移す
          if (tab.active) {
            const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, newWebPageItemId)
            assertNonUndefined(newItemPath)
            External.instance.requestFocusAfterRendering(
              ItemTreeContentView.focusableDomElementId(newItemPath)
            )
          }
        } else {
          // アクティブアイテムの最初の子として追加する
          CurrentState.insertFirstChildItem(targetItemId, newWebPageItemId)

          // フォーカスを移す
          if (tab.active) {
            const newItemPath = targetItemPath.push(newWebPageItemId)
            External.instance.requestFocusAfterRendering(
              ItemTreeContentView.focusableDomElementId(newItemPath)
            )
          }
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
            External.instance.requestFocusAfterRendering(
              ItemTreeContentView.focusableDomElementId(newItemPath)
            )
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
    }
  })
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  doWithErrorHandling(() => {
    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
    // document.titleを変更した際はonUpdatedが呼ばれる。自身に対応するアイテムIDは存在しない
    if (itemId === undefined) return

    reflectInWebPageItem(itemId, tab)

    CurrentState.commit()
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
  doWithErrorHandling(() => {
    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
    assertNonUndefined(itemId)
    External.instance.tabItemCorrespondence.untieTabAndItemByTabId(tabId)

    if (External.instance.hardUnloadedTabIds.has(tabId)) {
      // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムは削除しない
      External.instance.hardUnloadedTabIds.delete(tabId)
    } else if (CurrentState.isItem(itemId)) {
      // 対応するウェブページアイテムを削除する
      CurrentState.deleteItemItself(itemId)
    }

    CurrentState.commit()
  })
}

export async function onActivated(tabActiveInfo: TabActiveInfo) {
  doWithErrorHandling(() => {
    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabActiveInfo.tabId)
    if (itemId !== undefined) {
      CurrentState.updateItemTimestamp(itemId)
      CurrentState.commit()
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

      // アクティブページの最後の子として追加する
      const activePageId = Internal.instance.state.activePageId
      CurrentState.insertLastChildItem(activePageId, newWebPageItemId)
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
  return new Promise((resolve) => {
    chrome.windows.getAll({populate: true, windowTypes: ['normal']}, (windows) => {
      resolve(windows.flatMap((window) => window.tabs ?? []))
    })
  })
}

export function onWindowFocusChanged(windowId: integer) {
  External.instance.lastFocusedWindowId = windowId
}
