import MessageSender = chrome.runtime.MessageSender
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import TabActiveInfo = chrome.tabs.TabActiveInfo
import Tab = chrome.tabs.Tab
import {List} from 'immutable'
import {integer, ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {WebPageItem} from 'src/TreeifyWindow/Internal/State'
import {External} from 'src/TreeifyWindow/External/External'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {doWithErrorHandling} from 'src/Common/Debug/report'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  doWithErrorHandling(() => {
    switch (message.type) {
      case 'OnMoveMouseToLeftEnd':
        onMoveMouseToLeftEnd()
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
      const newWebPageItemId = NextState.createWebPageItem()
      reflectInWebPageItem(newWebPageItemId, tab)
      External.instance.tieTabAndItem(tab.id, newWebPageItemId)

      const targetItemPath = NextState.getTargetItemPath()

      if (url === 'chrome://newtab/' || tab.openerTabId === undefined) {
        if (targetItemPath.hasParent()) {
          // いわゆる「新しいタブ」は弟として追加する
          NextState.insertNextSiblingItem(targetItemPath, newWebPageItemId)

          // フォーカスを移す
          if (tab.active) {
            const newItemPath = targetItemPath.createSiblingItemPath(newWebPageItemId)
            assertNonUndefined(newItemPath)
            External.instance.requestFocusAfterRendering(
              ItemTreeContentView.focusableDomElementId(newItemPath)
            )
          }
        } else {
          // アクティブアイテムの最初の子として追加する
          NextState.insertFirstChildItem(targetItemPath.itemId, newWebPageItemId)

          // フォーカスを移す
          if (tab.active) {
            const newItemPath = targetItemPath.createChildItemPath(newWebPageItemId)
            External.instance.requestFocusAfterRendering(
              ItemTreeContentView.focusableDomElementId(newItemPath)
            )
          }
        }
      } else {
        const openerItemId = External.instance.tabIdToItemId.get(tab.openerTabId)
        assertNonUndefined(openerItemId)

        // openerの最後の子として追加する
        NextState.insertLastChildItem(openerItemId, newWebPageItemId)

        // openerがターゲットアイテムなら
        if (targetItemPath.itemId === openerItemId) {
          // フォーカスを移す
          if (tab.active) {
            const newItemPath = targetItemPath.createChildItemPath(newWebPageItemId)
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
      External.instance.tieTabAndItem(tab.id, itemId)
      External.instance.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())
    }
  })
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  doWithErrorHandling(() => {
    const itemId = External.instance.tabIdToItemId.get(tabId)
    assertNonUndefined(itemId)
    reflectInWebPageItem(itemId, tab)

    NextState.commit()
  })
}

// Tabの情報をウェブページアイテムに転写する
function reflectInWebPageItem(itemId: ItemId, tab: Tab) {
  if (tab.id !== undefined) {
    External.instance.tabIdToTab.set(tab.id, tab)
  }
  NextState.setWebPageItemTabTitle(itemId, tab.title ?? '')
  const url = tab.url || tab.pendingUrl || ''
  NextState.setWebPageItemUrl(itemId, url)
  NextState.setWebPageItemFaviconUrl(itemId, tab.favIconUrl ?? '')
}

export async function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  doWithErrorHandling(() => {
    const itemId = External.instance.tabIdToItemId.get(tabId)
    assertNonUndefined(itemId)

    if (External.instance.hardUnloadedTabIds.has(tabId)) {
      // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムは削除しない
      External.instance.hardUnloadedTabIds.delete(tabId)
    } else {
      // 対応するウェブページアイテムを削除する
      NextState.deleteItemItself(itemId)
    }

    External.instance.untieTabAndItemByTabId(tabId)
    NextState.commit()
  })
}

export async function onActivated(tabActiveInfo: TabActiveInfo) {
  doWithErrorHandling(() => {
    const itemId = External.instance.tabIdToItemId.get(tabActiveInfo.tabId)
    if (itemId !== undefined) {
      NextState.updateItemTimestamp(itemId)
      NextState.commit()
    }
  })
}

function onMoveMouseToLeftEnd() {
  // Treeifyウィンドウを最前面化する
  // TODO: 誤差だろうけれど最適化の余地が一応ある
  TreeifyWindow.open()
}

/**
 * 既存のタブとウェブページアイテムのマッチングを行う。
 * URLが完全一致しているかどうかで判定する。
 * TODO: 全タブと全ウェブページアイテムの総当り方式なので計算量が多い
 */
export async function matchTabsAndWebPageItems() {
  const tabs = await getAllNormalTabs()
  for (const tab of tabs) {
    assertNonUndefined(tab.id)

    const url = tab.pendingUrl ?? tab.url ?? ''
    const webPageItem = findWebPageItem(url)
    if (webPageItem === undefined) {
      // URLの一致するウェブページアイテムがない場合、
      // ウェブページアイテムを作る
      const newWebPageItemId = NextState.createWebPageItem()
      reflectInWebPageItem(newWebPageItemId, tab)
      External.instance.tieTabAndItem(tab.id, newWebPageItemId)

      // アクティブページの最後の子として追加する
      const activePageId = NextState.getActivePageId()
      NextState.insertLastChildItem(activePageId, newWebPageItemId)
    } else {
      // URLの一致するウェブページアイテムがある場合
      reflectInWebPageItem(webPageItem.itemId, tab)
      External.instance.tieTabAndItem(tab.id, webPageItem.itemId)
    }
  }

  // 正当性にやや疑問の残るcommit呼び出しだが、現状の設計では呼ばないとエラーになる
  NextState.commit()
}

// 指定されたURLを持つウェブページアイテムを探す。
// もし複数該当する場合は最初に見つかったものを返す。
// 見つからなかった場合はundefinedを返す。
function findWebPageItem(url: string): WebPageItem | undefined {
  const webPageItems = Internal.instance.currentState.webPageItems
  for (const itemId in webPageItems) {
    const webPageItem = webPageItems[itemId]
    if (url === webPageItem.url) {
      // URLが一致するウェブページアイテムが見つかった場合
      return webPageItem
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
