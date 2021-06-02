import {createFocusTrap, FocusTrap} from 'focus-trap'
import {assert} from 'src/Common/Debug/assert'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'

export type CommonDialogViewModel = {
  title: string
  content: Node
  onCloseDialog: () => void
}

export function CommonDialogView(viewModel: CommonDialogViewModel) {
  const onClickBackdrop = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        viewModel.onCloseDialog()
      }
    })
  }

  // ESCキー押下時にダイアログを閉じるためのイベントハンドラー。
  // focus-trapにはESCキー押下時にdeactivateする標準機能があるが、
  // それを使うとイベント発生順序の違いにより難解なエラーが起こるので自前でハンドリングする。
  const onKeyDown = (event: KeyboardEvent) => {
    doWithErrorCapture(() => {
      if (event.isComposing) return

      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        viewModel.onCloseDialog()
      }
    })
  }

  return createDivElement(
    'common-dialog',
    {
      click: onClickBackdrop,
      keydown: onKeyDown,
      DOMNodeInsertedIntoDocument: onInserted,
      DOMNodeRemovedFromDocument: onRemoved,
    },
    [
      createDivElement('common-dialog_frame', {}, [
        createDivElement('common-dialog_title-bar', {}, [document.createTextNode(viewModel.title)]),
        viewModel.content,
      ]),
    ]
  )
}

// onInsertedとonRemovedの間でFocusTrapインスタンスを共有するためのグローバル変数
let focusTrap: FocusTrap | undefined

function onInserted(event: Event) {
  doWithErrorCapture(() => {
    // フォーカストラップを作る
    if (event.target instanceof HTMLElement) {
      assert(focusTrap === undefined)
      focusTrap = createFocusTrap(event.target, {
        returnFocusOnDeactivate: true,
        escapeDeactivates: false,
      })
      focusTrap.activate()
    }
  })
}

function onRemoved(event: Event) {
  doWithErrorCapture(() => {
    // フォーカストラップを消す
    if (focusTrap !== undefined) {
      focusTrap.deactivate()
      focusTrap = undefined
    }
  })
}

export const CommonDialogCss = css`
  :root {
    --common-dialog-border-radius: 5px;

    --common-dialog-title-bar-background: hsl(0, 0%, 25%);
  }

  .common-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* ツールバーやサイドバーより高い位置にいる */
    z-index: 3;

    /* バックドロップ */
    background: hsla(0, 0%, 0%, 10%);

    /* ダイアログを画面中央に表示する */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .common-dialog_frame {
    border-radius: var(--common-dialog-border-radius);
    /* 子要素を角丸からはみ出させない */
    overflow: hidden;

    background: hsl(0, 0%, 100%);
    box-shadow: 0 1.5px 8px hsl(0, 0%, 50%);
  }

  .common-dialog_title-bar {
    font-size: 15px;
    padding: 0.3em;

    background: var(--common-dialog-title-bar-background);
    color: white;
  }
`
