import {StableTab} from 'src/Common/basicType'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

// TODO: 永続化された値で初期化する
let nextNewStableTabId = 1

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

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(async (tab) => {
    const stableTab: StableTab = {
      stableTabId: nextNewStableTabId++,
      ...tab,
    }

    if (await TreeifyWindow.exists()) {
      // TODO: Treeifyウィンドウが存在したとしてもready状態かどうかは分からないのでは？

      // Treeifyウィンドウが存在するときはイベントを転送する
      TreeifyWindow.sendMessage({
        type: 'OnTabCreated',
        stableTab,
      })
    }
  })
}
