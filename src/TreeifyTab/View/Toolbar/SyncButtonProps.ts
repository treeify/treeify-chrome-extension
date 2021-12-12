import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { State } from 'src/TreeifyTab/Internal/State'

export type SyncButtonProps = {
  syncWith: State['syncWith']
  hasUpdatedSinceSync: boolean
  isAlreadyOpen: boolean
}

export function createSyncButtonProps(): SyncButtonProps {
  return {
    syncWith: Internal.instance.state.syncWith,
    hasUpdatedSinceSync: External.instance.hasUpdatedSinceSync,
    isAlreadyOpen: External.instance.dataFolder !== undefined,
  }
}
