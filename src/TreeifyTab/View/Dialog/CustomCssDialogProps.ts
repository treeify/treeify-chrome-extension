import {assertNonNull} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyTab/External/External'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type CustomCssDialogProps = {
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createCustomCssDialogProps(): CustomCssDialogProps {
  const onClickFinishButton = () => {
    const editBox = document.querySelector<HTMLElement>('.custom-css-dialog_code')
    assertNonNull(editBox)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
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
