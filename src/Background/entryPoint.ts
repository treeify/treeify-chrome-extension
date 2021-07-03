chrome.runtime.onInstalled.addListener(async () => {
  // 全ての既存タブでContent scriptを動かす
  const windows = await chrome.windows.getAll({populate: true})
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  for (const tab of tabs) {
    if (tab.id === undefined) continue
    if (tab.url?.startsWith('chrome://')) continue
    if (tab.url?.startsWith(chrome.runtime.getURL('TreeifyWindow/index.html'))) continue

    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['ContentScript/entryPoint.js'],
    })
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
