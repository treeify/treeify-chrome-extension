import MessageSender = chrome.runtime.MessageSender
import {List} from 'immutable'
import {ItemId, StableTab} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  switch (message.type) {
    case 'OnTabCreated':
      onTabCreated(message)
      break
    case 'OnTabUpdated':
      onTabUpdated(message)
      break
    case 'OnTabClosed':
      onTabClosed(message)
      break
    case 'OnTabActivated':
      onTabActivated(message)
      break
    case 'OnMoveMouseToLeftEnd':
      onMoveMouseToLeftEnd()
  }
}

function onTabCreated(message: TreeifyWindow.OnTabCreated) {
  // タブのデータをModelに登録
  Model.instance.currentState.stableTabs[message.stableTab.stableTabId] = message.stableTab

  const url = message.stableTab.url || message.stableTab.pendingUrl || ''
  const itemIdsForTabCreation = Model.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
  if (itemIdsForTabCreation.isEmpty()) {
    // タブに対応するウェブページアイテムがない時

    // ウェブページアイテムを作る
    const newWebPageItemId = NextState.createWebPageItem()
    reflectInWebPageItem(newWebPageItemId, message.stableTab)

    const focusedItemPath = NextState.getLastFocusedItemPath()
    if (focusedItemPath !== null) {
      // フォーカスの当たっているアイテムがあるなら、

      if (url === 'chrome://newtab/' && focusedItemPath.hasParent()) {
        // いわゆる「新しいタブ」は弟として追加する
        NextState.insertNextSiblingItem(focusedItemPath, newWebPageItemId)

        // フォーカスアイテムを更新する
        if (message.stableTab.active) {
          const newItemPath = focusedItemPath.createSiblingItemPath(newWebPageItemId)
          assertNonUndefined(newItemPath)
          NextState.setFocusedItemPath(newItemPath)
        }
      } else {
        // フォーカスアイテムの最初の子として追加する
        NextState.insertFirstChildItem(focusedItemPath.itemId, newWebPageItemId)

        // フォーカスアイテムを更新する
        if (message.stableTab.active) {
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
      if (message.stableTab.active) {
        const newItemPath = new ItemPath(List.of(activePageId, newWebPageItemId))
        NextState.setFocusedItemPath(newItemPath)
      }
    }
  } else {
    // 既存のウェブページアイテムに対応するタブが開かれた時

    const itemId = itemIdsForTabCreation.first(undefined)
    assertNonUndefined(itemId)
    reflectInWebPageItem(itemId, message.stableTab)
    Model.instance.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())
  }

  NextState.commit()
}

function onTabUpdated(message: TreeifyWindow.OnTabUpdated) {
  // タブのデータをModelに登録
  Model.instance.currentState.stableTabs[message.stableTab.stableTabId] = message.stableTab

  const itemId = Model.instance.currentState.stableTabIdToItemId[message.stableTab.stableTabId]
  reflectInWebPageItem(itemId, message.stableTab)

  NextState.commit()
}

// stableTabの情報をウェブページアイテムに転写する
function reflectInWebPageItem(itemId: ItemId, stableTab: StableTab) {
  NextState.setWebPageItemStableTabId(itemId, stableTab.stableTabId)
  NextState.setWebPageItemTabTitle(itemId, stableTab.title ?? '')
  const url = stableTab.url || stableTab.pendingUrl || ''
  NextState.setWebPageItemUrl(itemId, url)
  NextState.setWebPageItemFaviconUrl(itemId, stableTab.favIconUrl ?? '')
}

function onTabClosed(message: TreeifyWindow.OnTabClosed) {
  // Modelのタブデータを削除
  NextState.getBatchizer().deleteProperty(
    PropertyPath.of('stableTabs', message.stableTab.stableTabId)
  )

  assertNonUndefined(message.stableTab.id)
  const itemId = Model.instance.currentState.stableTabIdToItemId[message.stableTab.stableTabId]
  if (Model.instance.hardUnloadedTabIds.has(message.stableTab.id)) {
    // ハードアンロードによりタブが閉じられた場合、ウェブページアイテムとタブの紐付けを削除する
    NextState.setWebPageItemStableTabId(itemId, null)

    Model.instance.hardUnloadedTabIds.delete(message.stableTab.id)
  } else {
    // 対応するウェブページアイテムを削除する
    NextState.deleteItemItself(itemId)
  }

  NextState.commit()
}

function onTabActivated(message: TreeifyWindow.OnTabActivated) {
  const itemId = Model.instance.currentState.stableTabIdToItemId[message.stableTabId]
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
