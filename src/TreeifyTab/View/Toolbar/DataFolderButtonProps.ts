import { External } from 'src/TreeifyTab/External/External'

export type DataFolderButtonProps = {
  isAlreadyOpen: boolean
  isCompleted: boolean
}

export function createDataFolderButtonProps(): DataFolderButtonProps {
  return {
    isAlreadyOpen: External.instance.dataFolder !== undefined,
    isCompleted:
      External.instance.dataFolder !== undefined && External.instance.alreadyWrittenToDataFolder,
  }
}
