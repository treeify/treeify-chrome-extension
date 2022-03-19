import { External } from 'src/TreeifyTab/External/External'

export type SearchDialogProps = {
  initialSearchQuery: string | undefined
}

export function createSearchDialogProps(): SearchDialogProps {
  if (External.instance.dialogState?.type !== 'SearchDialog') {
    throw Error("External.instance.dialogState?.type !== 'SearchDialog'")
  }

  return {
    initialSearchQuery: External.instance.dialogState.initialSearchQuery,
  }
}
