import hljs from 'highlight.js'
import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog, State} from 'src/TreeifyWindow/Internal/State'
import {
  createButtonElement,
  createDivElement,
  createElement,
  createInputElement,
} from 'src/TreeifyWindow/View/createElement'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

export type CodeBlockItemEditDialogViewModel = CodeBlockItemEditDialog & {
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createCodeBlockItemEditDialogViewModel(
  state: State
): CodeBlockItemEditDialogViewModel | undefined {
  if (state.codeBlockItemEditDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  return {
    ...state.codeBlockItemEditDialog,
    onClickFinishButton: () => {
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
    content: createDivElement('code-block-edit-dialog_content', {}, [
      createElement('textarea', 'code-block-edit-dialog_code', {}, [
        document.createTextNode(viewModel.code),
      ]),
      createDivElement('code-block-edit-dialog_language-area', {}, [
        createElement('label', {}, {}, '言語名'),
        createInputElement({
          class: 'code-block-edit-dialog_language',
          type: 'text',
          autocomplete: 'on',
          list: 'languages',
          value: viewModel.language,
        }),
      ]),
      createElement(
        'datalist',
        {id: 'languages'},
        {},
        hljs.listLanguages().map((language) => createElement('option', {value: language}))
      ),
      createDivElement('code-block-edit-dialog_button-area', {}, [
        createButtonElement({}, {click: viewModel.onClickFinishButton}, '完了'),
        createButtonElement({}, {click: viewModel.onClickCancelButton}, 'キャンセル'),
      ]),
    ]),
    onCloseDialog: () => {
      // ダイアログを閉じる
      CurrentState.setCodeBlockItemEditDialog(null)
      CurrentState.commit()
    },
  })
}
