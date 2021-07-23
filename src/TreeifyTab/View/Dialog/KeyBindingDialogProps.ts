import {List} from 'immutable'
import {External} from 'src/TreeifyTab/External/External'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {createKeyBindingProps, KeyBindingProps} from 'src/TreeifyTab/View/Dialog/KeyBindingProps'

export type KeyBindingDialogProps = {
  keyBindingPropses: List<KeyBindingProps>
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createKeyBindingDialogProps(): KeyBindingDialogProps {
  const bindings = Object.entries(Internal.instance.state.mainAreaKeyBindings)

  const onClickFinishButton = () => {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    keyBindingPropses: List(bindings).map(createKeyBindingProps),
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
