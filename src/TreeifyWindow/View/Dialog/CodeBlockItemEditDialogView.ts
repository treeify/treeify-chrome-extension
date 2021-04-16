import hljs from 'highlight.js'
import {html} from 'lit-html'
import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog, State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

export type CodeBlockItemEditDialogViewModel = CodeBlockItemEditDialog & {
  onClickOkButton: () => void
  onClickCancelButton: () => void
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
  }
}

export function CodeBlockItemEditDialogView(viewModel: CodeBlockItemEditDialogViewModel) {
  return CommonDialogView({
    title: 'コードブロック編集',
    content: html`
      <div class="code-block-edit-dialog_content">
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
    `,
    onCloseDialog: () => {
      // ダイアログを閉じる
      CurrentState.setCodeBlockItemEditDialog(null)
      CurrentState.commit()
    },
  })
}

export const CodeBlockItemEditDialogCss = css`
  .code-block-edit-dialog_content {
    width: 90vw;
    height: 50vh;

    /* ダイアログ内の基本レイアウトは縦並び */
    display: flex;
    flex-direction: column;
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
