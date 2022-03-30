import { External } from 'src/TreeifyTab/External/External'

export type DialogLayerProps = {
  dialogState: typeof External.instance.dialogState
}

export function createDialogLayerProps(): DialogLayerProps {
  return {
    dialogState: External.instance.dialogState,
  }
}
