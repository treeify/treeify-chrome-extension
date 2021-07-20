import {assertNonNull} from 'src/Common/Debug/assert'
import {TexEditDialog} from 'src/TreeifyTab/External/DialogState'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type TexEditDialogProps = {
  dialogTitle: string
  code: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onCloseDialog: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createTexEditDialogProps(dialog: TexEditDialog): TexEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const isEmptyTexItem = CurrentState.isEmptyTexItem(ItemPath.getItemId(targetItemPath))
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
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    dialogTitle: isEmptyTexItem ? 'TeXアイテム作成' : 'TeX編集',
    code: Internal.instance.state.texItems[ItemPath.getItemId(targetItemPath)].code,
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
  if (CurrentState.isEmptyTexItem(ItemPath.getItemId(CurrentState.getTargetItemPath()))) {
    NullaryCommand.deleteItem()
  }
}
