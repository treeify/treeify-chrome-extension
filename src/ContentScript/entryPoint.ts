window.addEventListener('mousemove', (event) => {
  const height = window.innerHeight
  // 画面の四隅のボタンなどを押したいだけなのにTreeifyのイベントが誤発動してしまう問題の対策
  if (event.clientY < height * 0.1 || height * 0.9 < event.clientY) return

  // マウスカーソルが画面左端に到達したとき。
  // この条件を満たすにはウィンドウが最大化状態であるか、ディスプレイの左端にぴったりくっついていないといけない。
  if (event.clientX === 0 && event.screenX === 0 && event.movementX < 0) {
    chrome.runtime.sendMessage({
      type: 'OnMouseMoveToLeftEnd',
    })
  }

  const rightEnd = screen.width - 1
  if (event.clientX === rightEnd && event.screenX === rightEnd && event.movementX > 0) {
    chrome.runtime.sendMessage({
      type: 'OnMouseMoveToRightEnd',
    })
  }
})
