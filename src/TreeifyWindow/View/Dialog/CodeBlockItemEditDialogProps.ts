import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type CodeBlockItemEditDialogProps = CodeBlockItemEditDialog & {
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createCodeBlockItemEditDialogProps(
  dialog: CodeBlockItemEditDialog
): CodeBlockItemEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  return {
    ...dialog,
    onClickFinishButton: () => {
      const targetItemId = ItemPath.getItemId(targetItemPath)

      // コードを更新
      const editBox = document.querySelector<HTMLDivElement>('.code-block-edit-dialog_code')
      assertNonNull(editBox)
      CurrentState.setCodeBlockItemCode(targetItemId, editBox.textContent ?? '')

      // 言語を更新
      const input = document.querySelector<HTMLInputElement>('.code-block-edit-dialog_language')
      assertNonNull(input)
      CurrentState.setCodeBlockItemLanguage(targetItemId, input.value)

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)

      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
  }
}
