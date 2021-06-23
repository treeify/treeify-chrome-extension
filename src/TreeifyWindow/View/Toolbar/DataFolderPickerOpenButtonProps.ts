import {External} from 'src/TreeifyWindow/External/External'

export type DataFolderPickerOpenButtonProps = {
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonProps(): DataFolderPickerOpenButtonProps {
  return {
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedChunkIds.size === 0,
  }
}
