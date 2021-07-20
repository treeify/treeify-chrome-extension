import {Dialog} from 'src/TreeifyTab/External/DialogState'
import {External} from 'src/TreeifyTab/External/External'

export type DialogLayerProps = {
  dialog: Dialog | undefined
}

export function createDialogLayerProps(): DialogLayerProps {
  return {
    dialog: External.instance.dialogState ?? undefined,
  }
}
