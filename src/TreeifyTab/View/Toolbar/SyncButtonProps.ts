import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'

export type SyncButtonProps = DiscriminatedUnion<{
  GoogleDrive: {}
  DataFolder: {
    isAlreadyOpen: boolean
    isCompleted: boolean
  }
}>

export function createSyncButtonProps(): SyncButtonProps {
  switch (Internal.instance.state.syncWith) {
    case 'Google Drive':
      return {
        type: 'GoogleDrive',
      }
    case 'Local':
      return {
        type: 'DataFolder',
        isAlreadyOpen: External.instance.dataFolder !== undefined,
        isCompleted:
          External.instance.dataFolder !== undefined &&
          External.instance.alreadyWrittenToDataFolder,
      }
  }
}
