import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'

export type SyncButtonProps = DiscriminatedUnion<{
  GoogleDrive: {
    hasUpdatedSinceSync: boolean
  }
  DataFolder: {
    isAlreadyOpen: boolean
    hasUpdatedSinceSync: boolean
  }
}>

export function createSyncButtonProps(): SyncButtonProps {
  switch (Internal.instance.state.syncWith) {
    case 'Google Drive':
      return {
        type: 'GoogleDrive',
        hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
      }
    case 'Local':
      return {
        type: 'DataFolder',
        isAlreadyOpen: External.instance.dataFolder !== undefined,
        hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
      }
  }
}
