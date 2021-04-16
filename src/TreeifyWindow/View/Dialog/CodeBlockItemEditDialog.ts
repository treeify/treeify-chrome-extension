import {createFocusTrap, FocusTrap} from 'focus-trap'
import hljs from 'highlight.js'
import {html} from 'lit-html'
import {assert, assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog, State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'

export type CodeBlockItemEditDialogViewModel = CodeBlockItemEditDialog & {
  onClickOkButton: () => void
  onClickCancelButton: () => void
  onClickBackdrop: (event: MouseEvent) => void
}

export function createCodeBlockItemEditDialogViewModel(
  state: State
): CodeBlockItemEditDialogViewModel | undefined {
  if (state.codeBlockItemEditDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  return {
    ...state.codeBlockItemEditDialog,
    onClickOkButton: () => {
      const targetItemId = ItemPath.getItemId(targetItemPath)

      // コードを更新
      const textarea = document.querySelector<HTMLTextAreaElement>('.code-block-edit-dialog_code')
      assertNonNull(textarea)
      CurrentState.setCodeBlockItemCode(targetItemId, textarea.value)

      // 言語を更新
      const input = document.querySelector<HTMLInputElement>('.code-block-edit-dialog_language')
      assertNonNull(input)
      CurrentState.setCodeBlockItemLanguage(targetItemId, input.value)

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)

      // ダイアログを閉じる
      CurrentState.setCodeBlockItemEditDialog(null)
      CurrentState.commit()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setCodeBlockItemEditDialog(null)
      CurrentState.commit()
    },
    onClickBackdrop: (event: MouseEvent) => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        CurrentState.setCodeBlockItemEditDialog(null)
        CurrentState.commit()
      }
    },
  }
}

export function CodeBlockItemEditDialogView(viewModel: CodeBlockItemEditDialogViewModel) {
  return html`<div
    class="code-block-edit-dialog"
    @click=${viewModel.onClickBackdrop}
    @keydown=${onKeyDown}
    @DOMNodeInsertedIntoDocument=${onInserted}
    @DOMNodeRemovedFromDocument=${onRemoved}
  >
    <div class="code-block-edit-dialog_frame">
      <div class="code-block-edit-dialog_title-bar">コードブロック編集</div>
      <textarea class="code-block-edit-dialog_code">${viewModel.code}</textarea>
      <div class="code-block-edit-dialog_language-area">
        <label>言語名</label>
        <input
          class="code-block-edit-dialog_language"
          type="text"
          autocomplete="on"
          list="languages"
          value=${viewModel.language}
        />
      </div>
      <datalist id="languages">
        ${hljs.listLanguages().map((language) => html`<option value=${language}></option>`)}
      </datalist>
      <div class="code-block-edit-dialog_button-area">
        <button @click=${viewModel.onClickOkButton}>OK</button>
        <button @click=${viewModel.onClickCancelButton}>キャンセル</button>
      </div>
    </div>
  </div> `
}

// onInsertedとonRemovedの間でFocusTrapインスタンスを共有するためのグローバル変数
let focusTrap: FocusTrap | undefined

function onInserted(event: Event) {
  // フォーカストラップを作る
  if (event.target instanceof HTMLElement) {
    assert(focusTrap === undefined)
    focusTrap = createFocusTrap(event.target, {
      returnFocusOnDeactivate: true,
      escapeDeactivates: false,
    })
    focusTrap.activate()
  }
}

function onRemoved(event: Event) {
  // フォーカストラップを消す
  if (focusTrap !== undefined) {
    focusTrap.deactivate()
    focusTrap = undefined
  }
}

// ESCキー押下時にダイアログを閉じるためのイベントハンドラー。
// focus-trapにはESCキー押下時にdeactivateする標準機能があるが、
// それを使うとイベント発生順序の違いにより難解なエラーが起こるので自前でハンドリングする。
function onKeyDown(event: KeyboardEvent) {
  if (event.isComposing) return

  if (InputId.fromKeyboardEvent(event) === '0000Escape') {
    CurrentState.setCodeBlockItemEditDialog(null)
    CurrentState.commit()
  }
}

export const CodeBlockItemEditDialogCss = css`
  :root {
    --dialog-border-radius: 5px;

    --dialog-title-bar-background: hsl(0, 0%, 25%);
  }

  .code-block-edit-dialog {
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

  .code-block-edit-dialog_frame {
    flex: 0 0 90%;
    height: 50%;

    border-radius: var(--dialog-border-radius);
    /* 子要素を角丸からはみ出させない */
    overflow: hidden;

    background: hsl(0, 0%, 100%);
    box-shadow: 0 1.5px 8px hsl(0, 0%, 50%);

    /* ダイアログ内の基本レイアウトは縦並び */
    display: flex;
    flex-direction: column;
  }

  .code-block-edit-dialog_title-bar {
    font-size: 15px;
    padding: 0.3em;

    background: var(--dialog-title-bar-background);
    color: white;
  }

  .code-block-edit-dialog_code {
    /* 表示範囲をタイトルバーやボタンエリアを除くダイアログ全域に広げる */
    flex: 1 0;

    margin: 1em;

    white-space: nowrap;
  }

  .code-block-edit-dialog_language-area {
    display: flex;

    margin-left: 1em;
    margin-right: 1em;
  }

  .code-block-edit-dialog_language {
    flex: 1 0;
  }

  .code-block-edit-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 1em 1em auto;
  }
`
