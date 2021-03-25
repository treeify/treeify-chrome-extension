import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

window.addEventListener('mousemove', (event) => {
  // マウスカーソルが画面左端に到達したとき。
  // この条件を満たすにはウィンドウが最大化状態であるか、ディスプレイの左端にぴったりくっついていないといけない。
  if (event.clientX === 0 && event.screenX === 0 && event.movementX < 0) {
    TreeifyWindow.sendMessage({
      type: 'OnMouseMoveToLeftEnd',
    })
  }
})

document.addEventListener('mouseenter', (event) => {
  TreeifyWindow.sendMessage({
    type: 'OnMouseEnter',
  })
})
