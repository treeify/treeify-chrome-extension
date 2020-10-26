// Treeifyウィンドウを開く
// TODO: 既にTreeifyウィンドウが存在する場合の分岐を追加する
chrome.windows.create({
  url: chrome.extension.getURL('TreeifyWindow/index.html'),
  type: 'popup',
  // TODO: ウィンドウの位置やサイズを記憶する
  width: 400,
  height: 1200,
  top: 0,
  left: 0,
})
