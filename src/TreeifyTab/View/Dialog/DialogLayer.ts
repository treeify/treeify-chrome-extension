import {Dialog} from 'src/TreeifyTab/External/DialogState'
import {External} from 'src/TreeifyTab/External/External'
import {State} from 'src/TreeifyTab/Internal/State'

export type DialogLayerProps = {
  dialog: Dialog | undefined
}

export function createDialogLayerProps(state: State): DialogLayerProps {
  return {
    dialog: External.instance.dialogState ?? undefined,
  }
}
