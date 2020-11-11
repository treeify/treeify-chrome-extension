import {onCreated, processExistingTabs} from 'src/Background/tabsEventListener'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

entryPoint()

// バックグラウンドページの起動時（≒Treeifyインストール時とブラウザ起動時）に実行される処理
async function entryPoint() {
  // Treeifyウィンドウを開く
  await TreeifyWindow.open()

  // chrome://extensions/shortcuts で設定されるコマンド呼び出しのリスナー
  chrome.commands.onCommand.addListener((commandName) => {
    switch (commandName) {
      case 'open-treeify-window':
        // Treeifyウィンドウを開く
        TreeifyWindow.open()
        break
    }
  })

  // この時点で既に存在するタブをTreeify側で把握する
  await processExistingTabs()

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
}
