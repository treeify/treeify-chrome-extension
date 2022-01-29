import { External } from 'src/TreeifyTab/External/External'

export type SyncButtonProps = {
  hasUpdatedSinceSync: boolean
  isInSync: boolean
  isDownload: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
    isInSync: External.instance.isInSync,
    isDownload: External.instance.backgroundDownload !== undefined,
  }
}
