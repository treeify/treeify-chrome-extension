import { External } from 'src/TreeifyTab/External/External'

export type SyncButtonProps = {
  isAlreadyOpen: boolean
  isCompleted: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    isAlreadyOpen: External.instance.dataFolder !== undefined,
    isCompleted:
      External.instance.dataFolder !== undefined && External.instance.alreadyWrittenToDataFolder,
  }
}
