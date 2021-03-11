import MessageSender = chrome.runtime.MessageSender
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import TabActiveInfo = chrome.tabs.TabActiveInfo
import Tab = chrome.tabs.Tab
import {List} from 'immutable'
import {integer, ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {WebPageItem} from 'src/TreeifyWindow/Model/State'
import {External} from 'src/TreeifyWindow/External/External'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  switch (message.type) {
    case 'OnMoveMouseToLeftEnd':
      onMoveMouseToLeftEnd()
      break
    // TODO: 網羅性チェックをしていない理由はなんだろう？
  }
}

export function onCreated(tab: Tab) {
  // もしこうなるケースがあるならきちんと対応を考えたいのでクラッシュさせる
  assertNonUndefined(tab.id)

  const url = tab.url || tab.pendingUrl || ''
  const itemIdsForTabCreation = External.urlToItemIdsForTabCreation.get(url) ?? List.of()
  if (itemIdsForTabCreation.isEmpty()) {
    // タブに対応するウェブページアイテムがない時

    // ウェブページアイテムを作る
    const newWebPageItemId = NextState.createWebPageItem()
    reflectInWebPageItem(newWebPageItemId, tab)
    External.tieTabAndItem(tab.id, newWebPageItemId)

    const focusedItemPath = NextState.getLastFocusedItemPath()
    if (focusedItemPath !== null) {
      // フォーカスの当たっているアイテムがあるなら、

      if (url === 'chrome://newtab/' && focusedItemPath.hasParent()) {
        // いわゆる「新しいタブ」は弟として追加する
        NextState.insertNextSiblingItem(focusedItemPath, newWebPageItemId)

        // フォーカスアイテムを更新する
        if (tab.active) {
          const newItemPath = focusedItemPath.createSiblingItemPath(newWebPageItemId)
          assertNonUndefined(newItemPath)
          NextState.setFocusedItemPath(newItemPath)
        }
      } else {
        // フォーカスアイテムの最初の子として追加する
        NextState.insertFirstChildItem(focusedItemPath.itemId, newWebPageItemId)

        // フォーカスアイテムを更新する
        if (tab.active) {
          const newItemPath = focusedItemPath.createChildItemPath(newWebPageItemId)
          NextState.setFocusedItemPath(newItemPath)
        }
      }
    } else {
      // フォーカスの当たっているアイテムがないなら、
      // アクティブページの最初の子として追加する
      const activePageId = NextState.getActivePageId()
      NextState.insertFirstChildItem(activePageId, newWebPageItemId)

      // フォーカスアイテムを更新する
      if (tab.active) {
        const newItemPath = new ItemPath(List.of(activePageId, newWebPageItemId))
        NextState.setFocusedItemPath(newItemPath)
      }
    }
  } else {
    // 既存のウェブページアイテムに対応するタブが開かれた時

    const itemId = itemIdsForTabCreation.first(undefined)
    assertNonUndefined(itemId)
    reflectInWebPageItem(itemId, tab)
    External.tieTabAndItem(tab.id, itemId)
    External.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())
  }
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  const itemId = External.tabIdToItemId.get(tabId)
  assertNonUndefined(itemId)
  reflectInWebPageItem(itemId, tab)

  NextState.commit()
}

// Tabの情報をウェブページアイテムに転写する
function reflectInWebPageItem(itemId: ItemId, tab: Tab) {
  if (tab.id !== undefined) {
    External.tabIdToTab.set(tab.id, tab)
  }
  NextState.setWebPageItemTabTitle(itemId, tab.title ?? '')
  const url = tab.url || tab.pendingUrl || ''
  NextState.setWebPageItemUrl(itemId, url)
  NextState.setWebPageItemFaviconUrl(itemId, tab.favIconUrl ?? '')
}

export async function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  const itemId = External.tabIdToItemId.get(tabId)
  assertNonUndefined(itemId)

  if (External.hardUnloadedTabIds.has(tabId)) {
    // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムは削除しない
    External.hardUnloadedTabIds.delete(tabId)
  } else {
    // 対応するウェブページアイテムを削除する
    NextState.deleteItemItself(itemId)
  }

  External.untieTabAndItemByTabId(tabId)
  NextState.commit()
}

export async function onActivated(tabActiveInfo: TabActiveInfo) {
  const itemId = External.tabIdToItemId.get(tabActiveInfo.tabId)
  if (itemId !== undefined) {
    NextState.updateItemTimestamp(itemId)
    NextState.commit()
  }
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
      External.tieTabAndItem(tab.id, newWebPageItemId)

      // アクティブページの最後の子として追加する
      const activePageId = NextState.getActivePageId()
      NextState.insertLastChildItem(activePageId, newWebPageItemId)
    } else {
      // URLの一致するウェブページアイテムがある場合
      External.tieTabAndItem(tab.id, webPageItem.itemId)
    }
  }

  // 正当性にやや疑問の残るcommit呼び出しだが、現状の設計では呼ばないとエラーになる
  NextState.commit()
}

// 指定されたURLを持つウェブページアイテムを探す。
// もし複数該当する場合は最初に見つかったものを返す。
// 見つからなかった場合はundefinedを返す。
function findWebPageItem(url: string): WebPageItem | undefined {
  const webPageItems = Model.currentState.webPageItems
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
