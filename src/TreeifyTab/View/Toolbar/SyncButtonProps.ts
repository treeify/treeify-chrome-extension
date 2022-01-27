import { External } from 'src/TreeifyTab/External/External'

export type SyncButtonProps = {
  hasUpdatedSinceSync: boolean
  isInSync: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
    isInSync: External.instance.isInSync,
  }
}
