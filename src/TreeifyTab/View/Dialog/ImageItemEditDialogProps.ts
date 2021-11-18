import { assertNonNull } from 'src/Common/Debug/assert'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type ImageItemEditDialogProps = {
  dialogTitle: string
  url: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onCloseDialog: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createImageItemEditDialogProps(): ImageItemEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const isEmptyImageItem = CurrentState.isEmptyImageItem(ItemPath.getItemId(targetItemPath))
  const onClickFinishButton = () => {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    const editBox = document.querySelector<HTMLInputElement>('.image-item-edit-dialog_url')
    assertNonNull(editBox)
    const url = editBox.value

    if (url.trim() !== '') {
      // URLが空でない場合

      // URLを更新
      CurrentState.setImageItemUrl(targetItemId, url)
      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)
    } else {
      // コードが空の場合

      Command.removeEdge()
    }

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    dialogTitle: isEmptyImageItem ? '画像項目作成' : '画像項目編集',
    url: Internal.instance.state.imageItems[ItemPath.getItemId(targetItemPath)].url,
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      onCloseDialog()
      Rerenderer.instance.rerender()
    },
    onCloseDialog,
    onKeyDown: (event) => {
      if (event.isComposing) return

      switch (InputId.fromKeyboardEvent(event)) {
        case '0000Enter':
        case '1000Enter':
          onClickFinishButton()
          break
      }
    },
  }
}

function onCloseDialog() {
  if (CurrentState.isEmptyImageItem(ItemPath.getItemId(CurrentState.getTargetItemPath()))) {
    Command.removeEdge()
  }
}
