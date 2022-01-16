import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { State } from 'src/TreeifyTab/Internal/State'

export type SyncButtonProps = {
  syncWith: State['syncWith']
  hasUpdatedSinceSync: boolean
  isDataFolderAlreadyOpened: boolean
  isInSync: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    syncWith: Internal.instance.state.syncWith,
    hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
    isDataFolderAlreadyOpened: External.instance.dataFolder !== undefined,
    isInSync: External.instance.isInSync,
  }
}
