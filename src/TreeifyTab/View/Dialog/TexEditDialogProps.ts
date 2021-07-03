import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {TexEditDialog} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type TexEditDialogProps = {
  code: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createTexEditDialogProps(dialog: TexEditDialog): TexEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const onClickFinishButton = () => {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    // コードを更新
    const editBox = document.querySelector<HTMLDivElement>('.tex-edit-dialog_code')
    assertNonNull(editBox)
    CurrentState.setTexItemCode(targetItemId, editBox.textContent ?? '')

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    // ダイアログを閉じる
    CurrentState.setDialog(null)
    Rerenderer.instance.rerender()
  }

  return {
    code: Internal.instance.state.texItems[ItemPath.getItemId(targetItemPath)].code,
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
