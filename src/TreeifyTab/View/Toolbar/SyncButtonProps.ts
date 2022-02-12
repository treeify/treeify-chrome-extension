import { External } from 'src/TreeifyTab/External/External'
import { getSyncedAt } from 'src/TreeifyTab/Persistent/sync'

export type SyncButtonProps = {
  hasUpdatedAfterSync: boolean
  isInSync: boolean
  hasNeverSynced: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    hasUpdatedAfterSync: External.instance.hasUpdatedAfterSync,
    isInSync: External.instance.isInSync,
    hasNeverSynced: getSyncedAt() === undefined,
  }
}
