import {External} from 'src/TreeifyTab/External/External'

export type DataFolderPickerOpenButtonProps = {
  isAlreadyOpen: boolean
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonProps(): DataFolderPickerOpenButtonProps {
  return {
    isAlreadyOpen: External.instance.dataFolder !== undefined,
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedChunkIds.size === 0,
  }
}
