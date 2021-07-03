import {assertNonNull} from 'src/Common/Debug/assert'
import {detectLanguage} from 'src/TreeifyTab/highlightJs'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {CodeBlockItemEditDialog} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

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
    const code = editBox.textContent ?? ''
    CurrentState.setCodeBlockItemCode(targetItemId, code)

    // 言語を自動検出
    CurrentState.setCodeBlockItemLanguage(targetItemId, detectLanguage(code))

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
