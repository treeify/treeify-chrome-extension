import {External} from 'src/TreeifyWindow/External/External'

export type DataFolderPickerOpenButtonViewModel = {
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonViewModel(): DataFolderPickerOpenButtonViewModel {
  return {
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedChunkIds.size === 0,
  }
}
