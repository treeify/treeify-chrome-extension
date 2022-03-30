chrome.runtime.onInstalled.addListener(async () => {
  // 全ての既存タブでContent scriptを動かす
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  for (const tab of tabs) {
    if (tab.id === undefined) continue
    if (tab.url?.startsWith('chrome://')) continue
    if (tab.url?.startsWith(chrome.runtime.getURL('treeify-tab.html'))) continue

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js'],
    })
  }

  await openTreeifyTab()
})

async function openTreeifyTab() {
  const treeifyTabUrl = chrome.runtime.getURL('treeify-tab.html')
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  if (!tabs.some((tab) => tab.url?.startsWith(treeifyTabUrl))) {
    await chrome.tabs.create({ url: treeifyTabUrl })
  }
}
