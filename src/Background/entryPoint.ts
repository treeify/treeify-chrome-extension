import CreateData = chrome.windows.CreateData

chrome.runtime.onInstalled.addListener(async () => {
  // 全ての既存タブでContent scriptを動かす
  for (const window of await chrome.windows.getAll({populate: true})) {
    if (window.tabs === undefined) continue

    for (const tab of window.tabs) {
      if (tab.id === undefined) continue
      if (tab.url?.startsWith('chrome://')) continue

      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['ContentScript/entryPoint.js'],
      })
    }
  }

  await openTreeifyWindow()
})
chrome.runtime.onStartup.addListener(openTreeifyWindow)

async function openTreeifyWindow() {
  const windows = await chrome.windows.getAll({populate: true, windowTypes: ['popup']})
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  const treeifyWindowUrl = chrome.runtime.getURL('TreeifyWindow/index.html')
  if (tabs.find((tab) => tab.url === treeifyWindowUrl) === undefined) {
    const createData: CreateData = {
      url: chrome.runtime.getURL('TreeifyWindow/index.html'),
      type: 'popup',
      // TODO: フルウィンドウモードで終了した場合は、次回起動時もフルウィンドウモードになってほしい気がする
      state: 'normal',
      width: 300,
      // windowオブジェクトが使えないので下記のようには指定できない
      // height: screen.availHeight,
      top: 0,
      left: 0,
    }

    await chrome.windows.create(createData)
  }
}
