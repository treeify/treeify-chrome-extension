import { External } from 'src/TreeifyTab/External/External'
import { getGoogleDriveSyncedAt } from 'src/TreeifyTab/Persistent/sync'
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
  const hasNeverSynced = getGoogleDriveSyncedAt() === undefined
  const hasSyncIssue = External.instance.hasSyncIssue
  const titleAttr = call(() => {
    if (hasSyncIssue) {
      return 'Googleドライブとの通信に失敗しました。ネットワーク接続を確認後、リトライしてください。\nネットワーク接続ができている場合はGoogleドライブの障害だと考えられます。'
    }
    if (hasNeverSynced) {
      return 'ローカルデータをアップロードしてGoogleドライブ内にデータファイルを作成します。\nもし既にデータファイルがあったらダウンロードしてローカルデータを上書きします。'
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
