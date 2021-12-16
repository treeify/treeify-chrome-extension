import { createFocusTrap } from 'focus-trap'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

/** モーダルダイアログを実現するためフォーカストラップを作るディレクティブ用の関数 */
export function setupFocusTrap(domElement: HTMLElement) {
  // フォーカストラップを作る
  const focusTrap = createFocusTrap(domElement, {
    returnFocusOnDeactivate: false,

    escapeDeactivates: false,
  })
  focusTrap.activate()

  return {
    destroy() {
      // フォーカストラップを消す
      focusTrap.deactivate()

      Rerenderer.instance.requestToFocusTargetItem()
    },
  }
}
