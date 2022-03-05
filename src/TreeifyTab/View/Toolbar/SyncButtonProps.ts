import { External } from 'src/TreeifyTab/External/External'
import { getSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { call } from 'src/Utility/function'

export type SyncButtonProps = {
  hasUpdatedAfterSync: boolean
  isInSync: boolean
  hasNeverSynced: boolean
  hasSyncIssue: boolean
  titleAttr: string
}

export function createSyncButtonProps(): SyncButtonProps {
  const hasUpdatedAfterSync = External.instance.hasUpdatedAfterSync
  const isInSync = External.instance.isInSync
  const hasNeverSynced = getSyncedAt() === undefined
  const hasSyncIssue = External.instance.hasSyncIssue
  const titleAttr = call(() => {
    if (hasNeverSynced) {
      return 'ローカルデータをアップロードしてGoogleドライブ内にデータファイルを作成します。\n既にデータファイルがあったらダウンロードしてローカルデータを上書きします。'
    }
    return 'ローカルデータとGoogleドライブ内のデータのうち新しい方で古い方を上書きします。'
  })
  return {
    hasUpdatedAfterSync,
    isInSync,
    hasNeverSynced,
    hasSyncIssue,
    titleAttr,
  }
}
