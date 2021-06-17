import CreateData = chrome.windows.CreateData

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

chrome.windows.create(createData)
