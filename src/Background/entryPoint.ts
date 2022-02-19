chrome.runtime.onInstalled.addListener(async () => {
  // 全ての既存タブでContent scriptを動かす
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  for (const tab of tabs) {
    if (tab.id === undefined) continue
    if (tab.url?.startsWith('chrome://')) continue
    if (tab.url?.startsWith(chrome.runtime.getURL('TreeifyTab/index.html'))) continue

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['ContentScript/entryPoint.js'],
    })
  }

  await openTreeifyTab()
})
chrome.runtime.onStartup.addListener(openTreeifyTab)

async function openTreeifyTab() {
  const treeifyTabUrl = chrome.runtime.getURL('TreeifyTab/index.html')
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  if (tabs.find((tab) => tab.url === treeifyTabUrl) === undefined) {
    await chrome.tabs.create({ url: treeifyTabUrl })
  }
}
