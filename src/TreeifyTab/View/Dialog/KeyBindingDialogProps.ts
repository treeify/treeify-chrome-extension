import {External} from 'src/TreeifyTab/External/External'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type KeyBindingDialogProps = {
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createKeyBindingDialogProps(): KeyBindingDialogProps {
  const onClickFinishButton = () => {
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
