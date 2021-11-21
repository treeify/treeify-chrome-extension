import { assertNonNull } from 'src/Common/Debug/assert'
import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { External } from 'src/TreeifyTab/External/External'
import { detectLanguage } from 'src/TreeifyTab/highlightJs'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type CodeBlockItemEditDialogProps = {
  dialogTitle: string
  code: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onCloseDialog: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createCodeBlockItemEditDialogProps(): CodeBlockItemEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const isEmptyCodeBlockItem = CurrentState.isEmptyCodeBlockItem(ItemPath.getItemId(targetItemPath))
  const onClickFinishButton = () => {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    const editBox = document.querySelector<HTMLDivElement>('.code-block-edit-dialog_code')
    assertNonNull(editBox)
    const code = editBox.textContent ?? ''

    if (code.trim() !== '') {
      // コードが空でない場合

      // コードを更新
      CurrentState.setCodeBlockItemCode(targetItemId, code)
      // 言語を自動検出
      CurrentState.setCodeBlockItemLanguage(targetItemId, detectLanguage(code))
      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)
    } else {
      // コードが空の場合

      // コードブロック項目を削除
      Command.removeEdge()
    }

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    dialogTitle: isEmptyCodeBlockItem ? 'コードブロック項目作成' : 'コードブロック編集',
    code: Internal.instance.state.codeBlockItems[ItemPath.getItemId(targetItemPath)].code,
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      onCloseDialog()
      Rerenderer.instance.rerender()
    },
    onCloseDialog,
    onKeyDown: (event) => {
      switch (InputId.fromKeyboardEvent(event)) {
        case '1000Enter':
          onClickFinishButton()
          break
      }
    },
  }
}

function onCloseDialog() {
  doWithErrorCapture(() => {
    if (CurrentState.isEmptyCodeBlockItem(ItemPath.getItemId(CurrentState.getTargetItemPath()))) {
      Command.removeEdge()
    }
  })
}
