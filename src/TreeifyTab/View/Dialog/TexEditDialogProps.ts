import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
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

    const editBox = document.querySelector<HTMLDivElement>('.tex-edit-dialog_code')
    assertNonNull(editBox)
    const code = editBox.textContent ?? ''

    if (code.trim() !== '') {
      // コードが空でない場合

      // コードを更新
      CurrentState.setTexItemCode(targetItemId, code)
      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)
    } else {
      // コードが空の場合

      // TeXアイテムを削除
      NullaryCommand.removeEdge()
    }

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
