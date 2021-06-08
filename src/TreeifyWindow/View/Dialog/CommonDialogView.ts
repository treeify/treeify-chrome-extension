import {createFocusTrap, FocusTrap} from 'focus-trap'
import {assert} from 'src/Common/Debug/assert'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'

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
