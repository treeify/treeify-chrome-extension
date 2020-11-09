import MessageSender = chrome.runtime.MessageSender
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

export const onMessage = (message: TreeifyWindow.Message, sender: MessageSender) => {
  switch (message.type) {
    case 'OnTabCreated':
      // TODO: ウェブページアイテムを作る
      break
  }
}
