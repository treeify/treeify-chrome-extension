import { pipe } from 'fp-ts/function'
import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { GoogleDrive } from 'src/TreeifyTab/External/GoogleDrive'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { CURRENT_SCHEMA_VERSION, State } from 'src/TreeifyTab/Internal/State'
import { getSyncedAt, setSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { restart } from 'src/TreeifyTab/startup'
import { RArray$, RSet$ } from 'src/Utility/fp-ts'
import { compress, decompress } from 'src/Utility/gzip'

export async function syncTreeifyData() {
  // ユーザーが認証用ログイン画面を閉じたりしたら、
  // getAccessToken()は何も応答しない。
  // なのでローディングインジケーターが無限にぐるぐるするのを防ぐために
  // このタイミングでgetAccessToken()を呼んでおく。
  await GoogleDrive.getAccessToken()

  if (External.instance.isInSync) return

  External.instance.isInSync = true
  Rerenderer.instance.rerender()
  try {
    const dataFileMetaData = await GoogleDrive.fetchDataFileMetaData()
    await syncWithGoogleDrive(dataFileMetaData)
    Rerenderer.instance.rerender()
  } finally {
    External.instance.isInSync = false
    Rerenderer.instance.rerender()
  }
}

// TODO: コマンドじゃない関数をCommand配下ファイルからexportするべきでない
export async function syncWithGoogleDrive(
  dataFileMetaData: GoogleDrive.DataFileMataData | undefined
) {
  if (dataFileMetaData === undefined) {
    // データファイルがない場合
    console.log('データファイルがない場合')

    console.log('create APIを呼んでファイル更新日時を記録して終了')
    // データファイルを作成し、日時を記録して終了
    const modifiedTime = await GoogleDrive.createDataFile(Internal.instance.state)
    setSyncedAt(modifiedTime)
    External.instance.hasUpdatedAfterSync = false
    Rerenderer.instance.rerender()
  } else {
    // データファイルがある場合
    console.log('データファイルがある場合')

    const syncedAt = getSyncedAt()
    const knownTimestamp = syncedAt !== undefined ? new Date(syncedAt).getTime() : -1
    const dataFileTimestamp = new Date(dataFileMetaData.modifiedTime).getTime()
    if (knownTimestamp < dataFileTimestamp) {
      // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
      console.log('syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ')

      const state: State = await getState(dataFileMetaData)

      if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
        showRequireUpdateMessage()
        return
      }

      setSyncedAt(dataFileMetaData.modifiedTime)
      await restart(state, syncedAt === undefined)
    } else if (knownTimestamp > dataFileTimestamp) {
      // ユーザーがデータファイルをロールバックさせた場合くらいしか到達しない特殊なケース
      console.log('例外的な状況でしか到達できない特殊なケース')

      const state: State = await getState(dataFileMetaData)

      if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
        showRequireUpdateMessage()
        return
      }

      setSyncedAt(dataFileMetaData.modifiedTime)
      await restart(state)
    } else {
      // データファイルの更新日時がsyncedAtと等しければ
      console.log('データファイルの更新日時がsyncedAtと等しければ')

      // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
      if (!External.instance.hasUpdatedAfterSync) return

      const gzipped = await compress(JSON.stringify(Internal.instance.state))
      const response = await GoogleDrive.updateFileWithMultipart(
        dataFileMetaData.id,
        new Blob(gzipped)
      )
      const responseJson = await response.json()
      setSyncedAt(responseJson.modifiedTime)
      External.instance.hasUpdatedAfterSync = false
      Rerenderer.instance.rerender()
    }
  }
}

async function getState(metaData: GoogleDrive.DataFileMataData): Promise<State> {
  const response = await GoogleDrive.readFile(metaData.id)
  const text = await decompress(await response.arrayBuffer())
  return JSON.parse(text)
}

function showRequireUpdateMessage() {
  alert('Treeifyのバージョンが古いためデータファイルを読み込めません。\nアップデートしてください。')
}

/**
 * ターゲット項目をワークスペースの除外項目リストに入れる。
 * もし既に除外されていれば除外を解除する。
 * ただしトップページは除外できない。
 */
export function toggleExcluded() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = pipe(
    RSet$.from(selectedItemPaths.map(ItemPath.getItemId)),
    RSet$.remove(TOP_ITEM_ID)
  )
  const excludedItemIds = RSet$.from(CurrentState.getExcludedItemIds())

  // いわゆるxorのメソッドが見当たらないので同等の処理をする
  const union = RSet$.union(selectedItemIds, excludedItemIds)
  const intersection = RSet$.intersection(selectedItemIds, excludedItemIds)
  CurrentState.setExcludedItemIds(RArray$.from(RSet$.difference(union, intersection)))
}

/**
 * 役割は2つ。
 * ・特定のキー入力でのブラウザのデフォルト動作を阻止するために割り当てる（preventDefaultが呼ばれるので）
 * ・キーボード操作設定ダイアログでキーバインドを追加した際の無難な初期値
 */
export function doNothing() {}
