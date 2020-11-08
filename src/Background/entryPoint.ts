import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

// Treeifyウィンドウを開く
TreeifyWindow.open()

// chrome://extensions/shortcuts で設定されるコマンド呼び出しのリスナー
chrome.commands.onCommand.addListener((commandName) => {
  switch (commandName) {
    case 'open-treeify-window':
      // Treeifyウィンドウを開く
      TreeifyWindow.open()
      break
  }
})
