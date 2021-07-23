import {List} from 'immutable'
import {CommandId} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type KeyBindingProps = {
  inputId: string
  commandIds: List<CommandId>
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createKeyBindingProps(binding: [InputId, List<CommandId>]): KeyBindingProps {
  const onClickFinishButton = () => {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    inputId: binding[0],
    commandIds: binding[1],
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
