import {External} from 'src/TreeifyTab/External/External'

export type DataFolderButtonProps = {
  isAlreadyOpen: boolean
  isGrayedOut: boolean
}

export function createDataFolderButtonProps(): DataFolderButtonProps {
  return {
    isAlreadyOpen: External.instance.dataFolder !== undefined,
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedChunkIds.size === 0,
  }
}
