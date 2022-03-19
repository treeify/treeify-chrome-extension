import { External } from 'src/TreeifyTab/External/External'

export type ReplaceDialogProps = {
  initialBeforeReplace: string | undefined
}

export function createReplaceDialogProps(): ReplaceDialogProps {
  if (External.instance.dialogState?.type !== 'ReplaceDialog') {
    throw Error("External.instance.dialogState?.type !== 'ReplaceDialog'")
  }

  return {
    initialBeforeReplace: External.instance.dialogState.initialBeforeReplace
  }
}
