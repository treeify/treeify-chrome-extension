window.addEventListener(
  'mousemove',
  (event) => {
    // マウスカーソルが画面左端に到達したとき。
    // この条件を満たすにはウィンドウが最大化状態であるか、ディスプレイの左端にぴったりくっついていないといけない。
    if (event.clientX === 0 && event.screenX === 0 && event.movementX < 0) {
      chrome.runtime.sendMessage({
        type: 'OnMouseMoveToLeftEnd',
        clientY: event.clientY,
      })
    }

    const rightEnd = screen.width - 1
    if (event.clientX === rightEnd && event.screenX === rightEnd && event.movementX > 0) {
      chrome.runtime.sendMessage({
        type: 'OnMouseMoveToRightEnd',
        clientY: event.clientY,
      })
    }
  },
  true
)
