import MessageSender = chrome.runtime.MessageSender
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
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
  }
}

function onTabCreated(message: TreeifyWindow.OnTabCreated) {
  // タブのデータをModelに登録
  Model.instance.currentState.stableTabs[message.stableTab.stableTabId] = message.stableTab

  // ウェブページアイテムを作る
  const newWebPageItemId = NextState.createWebPageItem()
  NextState.setWebPageItemStableTabId(newWebPageItemId, message.stableTab.stableTabId)
  NextState.setWebPageItemTabTitle(newWebPageItemId, message.stableTab.title ?? '')
  const url = message.stableTab.url || message.stableTab.pendingUrl || ''
  NextState.setWebPageItemUrl(newWebPageItemId, url)
  NextState.setWebPageItemFaviconUrl(newWebPageItemId, message.stableTab.favIconUrl ?? '')

  const focusedItemPath = NextState.getFocusedItemPath()
  // TODO: 残念ながら新しいタブを開いたときフォーカスアイテムはnullになっているので下記分岐は無意味
  if (focusedItemPath !== null) {
    // フォーカスアイテムの最初の子として追加する
    NextState.insertFirstChildItem(focusedItemPath.itemId, newWebPageItemId)
  } else {
    // アクティブページの最初の子として追加する
    const activePageId = NextState.getActivePageId()
    NextState.insertFirstChildItem(activePageId, newWebPageItemId)
  }

  NextState.commit()
}

function onTabUpdated(message: TreeifyWindow.OnTabUpdated) {
  // タブのデータをModelに登録
  Model.instance.currentState.stableTabs[message.stableTab.stableTabId] = message.stableTab

  const itemId = Model.instance.currentState.stableTabIdToItemId[message.stableTab.stableTabId]
  NextState.setWebPageItemStableTabId(itemId, message.stableTab.stableTabId)
  NextState.setWebPageItemTabTitle(itemId, message.stableTab.title ?? '')
  const url = message.stableTab.url || message.stableTab.pendingUrl || ''
  NextState.setWebPageItemUrl(itemId, url)
  NextState.setWebPageItemFaviconUrl(itemId, message.stableTab.favIconUrl ?? '')

  NextState.commit()
}

function onTabClosed(message: TreeifyWindow.OnTabClosed) {
  // Modelのタブデータを削除
  NextState.getBatchizer().deleteProperty(PropertyPath.of('stableTabs', message.stableTabId))

  const itemId = Model.instance.currentState.stableTabIdToItemId[message.stableTabId]
  NextState.setWebPageItemStableTabId(itemId, null)

  NextState.commit()
}
