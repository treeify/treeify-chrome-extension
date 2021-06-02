import {createFocusTrap, FocusTrap} from 'focus-trap'
import {assert} from 'src/Common/Debug/assert'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {createDivElement, createInputElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'

export type WebPageItemTitleSettingDialogViewModel = {
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  /** タイトル入力欄のテキストの初期値 */
  initialTitle: string
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogViewModel(
  state: State
): WebPageItemTitleSettingDialogViewModel | undefined {
  if (state.webPageItemTitleSettingDialog === null) return undefined

  const targetItemPath = state.pages[CurrentState.getActivePageId()].targetItemPath
  const targetItemId = ItemPath.getItemId(targetItemPath)

  return {
    webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
    initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
    onKeyDown: (event) => {
      doWithErrorCapture(() => {
        if (event.isComposing) return

        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          if (event.target.value === '') {
            // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
            CurrentState.setWebPageItemTitle(targetItemId, null)
          } else {
            CurrentState.setWebPageItemTitle(targetItemId, event.target.value)
          }
          // タイトル設定ダイアログを閉じる
          CurrentState.setWebPageItemTitleSettingDialog(null)
          CurrentState.commit()
        }

        if (InputId.fromKeyboardEvent(event) === '0000Escape') {
          CurrentState.setWebPageItemTitleSettingDialog(null)
          CurrentState.commit()
        }
      })
    },
  }
}

export function WebPageItemTitleSettingDialogView(
  viewModel: WebPageItemTitleSettingDialogViewModel
) {
  const style = `
    left: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.left}px;
    top: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.top}px;
    width: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.width}px;
    height: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.height}px;
  `
  return createDivElement(
    'web-page-item-title-setting-dialog',
    {
      click: onClickBackdrop,
      DOMNodeInsertedIntoDocument: onInserted,
      DOMNodeRemovedFromDocument: onRemoved,
    },
    [
      createDivElement({class: 'web-page-item-title-setting-dialog_frame', style}, {}, [
        createInputElement(
          {
            type: 'text',
            class: 'web-page-item-title-setting-dialog_text-box',
            value: viewModel.initialTitle,
          },
          {keydown: viewModel.onKeyDown}
        ),
      ]),
    ]
  )
}

function onClickBackdrop(event: Event) {
  doWithErrorCapture(() => {
    // ダイアログを閉じる
    if (event.eventPhase === Event.AT_TARGET) {
      CurrentState.setWebPageItemTitleSettingDialog(null)
      CurrentState.commit()
    }
  })
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
        // この機能を使うとイベント発生順序の違いにより難解なエラーが起こるので、
        // ESCキー押下時にダイアログを閉じる処理は自前で実装する。
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

export const WebPageItemTitleSettingDialogCss = css`
  .web-page-item-title-setting-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ウェブページアイテムのタイトル設定ダイアログ */
  .web-page-item-title-setting-dialog_frame {
    /*
    ウェブページアイテムの位置に合わせたフローティング。
    left, top, width, heightがJavaScriptで設定される。
    */
    position: absolute;
  }

  /* ウェブページアイテムのタイトル設定ダイアログのテキスト入力欄 */
  .web-page-item-title-setting-dialog_text-box {
    width: 100%;
    height: 100%;
  }
`
