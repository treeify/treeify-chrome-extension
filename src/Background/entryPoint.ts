chrome.runtime.onInstalled.addListener(async () => {
  // 全ての既存タブでContent scriptを動かす
  // TODO: flatMapを使って簡潔に書ける
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
  const windows = await chrome.windows.getAll({populate: true})
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  const treeifyWindowUrl = chrome.runtime.getURL('TreeifyWindow/index.html')
  if (tabs.find((tab) => tab.url === treeifyWindowUrl) === undefined) {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('TreeifyWindow/index.html'),
    })
  }
}
