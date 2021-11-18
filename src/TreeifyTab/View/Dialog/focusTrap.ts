import { createFocusTrap } from 'focus-trap'
import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'

/** モーダルダイアログを実現するためフォーカストラップを作るディレクティブ用の関数 */
export function setupFocusTrap(domElement: HTMLElement) {
  return doWithErrorCapture(() => {
    // フォーカストラップを作る
    const focusTrap = createFocusTrap(domElement, {
      returnFocusOnDeactivate: false,

      escapeDeactivates: false,
    })
    focusTrap.activate()

    return {
      destroy: () => {
        // フォーカストラップを消す
        focusTrap.deactivate()
      },
    }
  })
}
