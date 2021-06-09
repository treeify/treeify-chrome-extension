import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog, State} from 'src/TreeifyWindow/Internal/State'

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
