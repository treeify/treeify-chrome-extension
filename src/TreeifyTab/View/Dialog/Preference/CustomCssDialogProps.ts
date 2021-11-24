import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type CustomCssDialogProps = {
  code: string
  onSubmit: (newCode: string) => void
  onClickCancelButton: () => void
}

export function createCustomCssDialogProps(): CustomCssDialogProps {
  return {
    code: Internal.instance.state.customCss,
    onSubmit: (newCode: string) => {
      Internal.instance.mutate(newCode, PropertyPath.of('customCss'))

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
