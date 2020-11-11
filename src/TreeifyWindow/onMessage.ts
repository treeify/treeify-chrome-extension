import MessageSender = chrome.runtime.MessageSender
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  switch (message.type) {
    case 'OnTabCreated':
      // ウェブページアイテムを作る
      const newWebPageItemId = NextState.createWebPageItem()
      NextState.setWebPageItemTabTitle(newWebPageItemId, message.stableTab.title ?? '')
      const url = message.stableTab.url || message.stableTab.pendingUrl || ''
      NextState.setWebPageItemUrl(newWebPageItemId, url)

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
      break
  }
}
