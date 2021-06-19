import CreateData = chrome.windows.CreateData

;(async () => {
  // Treeifyウィンドウがあればフォーカスする
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
})()
