import MessageSender = chrome.runtime.MessageSender
import Tab = chrome.tabs.Tab
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import TabActiveInfo = chrome.tabs.TabActiveInfo
import {List} from 'immutable'
import {integer, ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

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
  const itemIdsForTabCreation = Model.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
  if (itemIdsForTabCreation.isEmpty()) {
    // タブに対応するウェブページアイテムがない時

    // ウェブページアイテムを作る
    const newWebPageItemId = NextState.createWebPageItem()
    reflectInWebPageItem(newWebPageItemId, tab)
    Model.instance.tieTabAndItem(tab.id, newWebPageItemId)

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
    Model.instance.tieTabAndItem(tab.id, itemId)
    Model.instance.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())
  }
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  const itemId = Model.instance.tabIdToItemId.get(tabId)
  assertNonUndefined(itemId)
  reflectInWebPageItem(itemId, tab)

  NextState.commit()
}

// Tabの情報をウェブページアイテムに転写する
function reflectInWebPageItem(itemId: ItemId, tab: Tab) {
  if (tab.id !== undefined) {
    Model.instance.tabIdToTab.set(tab.id, tab)
  }
  NextState.setWebPageItemTabTitle(itemId, tab.title ?? '')
  const url = tab.url || tab.pendingUrl || ''
  NextState.setWebPageItemUrl(itemId, url)
  NextState.setWebPageItemFaviconUrl(itemId, tab.favIconUrl ?? '')
}

export async function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  const itemId = Model.instance.tabIdToItemId.get(tabId)
  assertNonUndefined(itemId)

  if (Model.instance.hardUnloadedTabIds.has(tabId)) {
    // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムは削除しない
    Model.instance.hardUnloadedTabIds.delete(tabId)
  } else {
    // 対応するウェブページアイテムを削除する
    NextState.deleteItemItself(itemId)
  }

  Model.instance.untieTabAndItemByTabId(tabId)
  NextState.commit()
}

export async function onActivated(tabActiveInfo: TabActiveInfo) {
  const itemId = Model.instance.tabIdToItemId.get(tabActiveInfo.tabId)
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
