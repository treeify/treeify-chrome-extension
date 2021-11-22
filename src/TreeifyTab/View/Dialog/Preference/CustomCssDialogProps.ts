import { External } from 'src/TreeifyTab/External/External'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonNull } from 'src/Utility/Debug/assert'

export type CustomCssDialogProps = {
  code: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createCustomCssDialogProps(): CustomCssDialogProps {
  const onClickFinishButton = () => {
    const editBox = document.querySelector<HTMLElement>('.custom-css-dialog_code')
    assertNonNull(editBox)

    Internal.instance.mutate(editBox.innerText, PropertyPath.of('customCss'))

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    code: Internal.instance.state.customCss,
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
