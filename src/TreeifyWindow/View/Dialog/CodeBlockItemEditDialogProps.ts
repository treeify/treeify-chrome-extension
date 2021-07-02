import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CodeBlockItemEditDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type CodeBlockItemEditDialogProps = CodeBlockItemEditDialog & {
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createCodeBlockItemEditDialogProps(
  dialog: CodeBlockItemEditDialog
): CodeBlockItemEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const onClickFinishButton = () => {
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
  }

  return {
    ...dialog,
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
    onKeyDown: (event) => {
      switch (InputId.fromKeyboardEvent(event)) {
        case '1000Enter':
          onClickFinishButton()
          break
      }
    },
  }
}
