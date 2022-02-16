import { External } from 'src/TreeifyTab/External/External'
import { getSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { call } from 'src/Utility/function'

export type SyncButtonProps = {
  hasUpdatedAfterSync: boolean
  isInSync: boolean
  hasNeverSynced: boolean
  titleAttr: string
}

export function createSyncButtonProps(): SyncButtonProps {
  const hasUpdatedAfterSync = External.instance.hasUpdatedAfterSync
  const isInSync = External.instance.isInSync
  const hasNeverSynced = getSyncedAt() === undefined
  const titleAttr = call(() => {
    if (hasNeverSynced) {
      return 'Google Drive内にデータファイルを作成します。\n既にデータファイルがあったらダウンロードしてローカルデータを上書きします。'
    }
    if (hasUpdatedAfterSync) {
      return 'ローカルデータをGoogle Driveに上書きアップロードします。\nただしGoogle Drive内に未知のデータがあったらダウンロードしてローカルデータを上書きします。'
    }
    return 'Google Drive内に未知のデータがあったらダウンロードしてローカルデータを上書きします。'
  })
  return {
    hasUpdatedAfterSync,
    isInSync,
    hasNeverSynced,
    titleAttr,
  }
}
