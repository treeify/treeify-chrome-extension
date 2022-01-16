import { pipe } from 'fp-ts/function'
import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { focusMainAreaBackground } from 'src/TreeifyTab/External/domTextSelection'
import { External } from 'src/TreeifyTab/External/External'
import { GoogleDrive } from 'src/TreeifyTab/External/GoogleDrive'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { CURRENT_SCHEMA_VERSION, State } from 'src/TreeifyTab/Internal/State'
import { getSyncedAt, setSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { restart } from 'src/TreeifyTab/startup'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { dump } from 'src/Utility/Debug/logger'
import { RArray$, RSet$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { compress, decompress } from 'src/Utility/gzip'

export function syncTreeifyData() {
  if (External.instance.isInSync) return

  External.instance.isInSync = true
  call(async () => {
    switch (Internal.instance.state.syncWith) {
      case 'Google Drive':
        await syncWithGoogleDrive()
        break
      case 'Local':
        await syncWithDataFolder()
        break
    }
    Rerenderer.instance.rerender()
  }).finally(() => {
    External.instance.isInSync = false
  })
}

async function syncWithGoogleDrive() {
  const DATA_FILE_NAME = 'Treeify data.json.gz'

  const dataFileMetaData = await GoogleDrive.fetchDataFileMetaData()
  // TODO: リリースする前にログ出力を削除する
  dump(dataFileMetaData)
  if (dataFileMetaData === undefined) {
    // データファイルがない場合
    console.log('データファイルがない場合')

    console.log('create APIを呼んでファイル更新日時を記録して終了')
    // create APIを呼んでファイル更新日時を記録して終了
    const gzipped = await compress(JSON.stringify(Internal.instance.state))
    const response = await GoogleDrive.createFileWithMultipart(DATA_FILE_NAME, new Blob(gzipped))
    const responseJson = await response.json()
    setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
    External.instance.hasUpdatedSinceSync = false
    Rerenderer.instance.rerender()
  } else {
    // データファイルがある場合
    console.log('データファイルがある場合')

    const syncedAt = getSyncedAt(Internal.instance.state.syncWith)
    const knownTimestamp = syncedAt !== undefined ? new Date(syncedAt).getTime() : -1
    const dataFileTimestamp = new Date(dataFileMetaData.modifiedTime).getTime()
    if (knownTimestamp < dataFileTimestamp) {
      // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
      console.log('syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ')

      // get APIでファイル内容をダウンロードする
      const state: State = await getState(dataFileMetaData)

      if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
        alert(
          'Treeifyのバージョンが古いためデータファイルを読み込めません。\nアップデートしてください。'
        )
        return
      }

      // ローカルStateのmaxItemIdの方が大きい場合、ローカルStateの方が「先に進んでいる」と判断する
      dump(state.maxItemId, Internal.instance.state.maxItemId)
      if (state.maxItemId < Internal.instance.state.maxItemId) {
        const gzipped = await compress(JSON.stringify(Internal.instance.state))
        const response = await GoogleDrive.updateFileWithMultipart(
          dataFileMetaData.id,
          new Blob(gzipped)
        )
        const responseJson = await response.json()
        setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      } else {
        setSyncedAt(Internal.instance.state.syncWith, dataFileMetaData.modifiedTime)
        await restart(state, syncedAt === undefined)
      }
    } else if (knownTimestamp > dataFileTimestamp) {
      // ユーザーがデータファイルをロールバックさせた場合くらいしか到達しない特殊なケース
      console.log('例外的な状況でしか到達できない特殊なケース')

      const state: State = await getState(dataFileMetaData)

      if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
        alert(
          'Treeifyのバージョンが古いためデータファイルを読み込めません。\nアップデートしてください。'
        )
        return
      }

      setSyncedAt(Internal.instance.state.syncWith, dataFileMetaData.modifiedTime)
      await restart(state)
    } else {
      // データファイルの更新日時がsyncedAtと等しければ
      console.log('データファイルの更新日時がsyncedAtと等しければ')

      // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
      if (!External.instance.hasUpdatedSinceSync) return

      const gzipped = await compress(JSON.stringify(Internal.instance.state))
      const response = await GoogleDrive.updateFileWithMultipart(
        dataFileMetaData.id,
        new Blob(gzipped)
      )
      const responseJson = await response.json()
      setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
      External.instance.hasUpdatedSinceSync = false
      Rerenderer.instance.rerender()
    }
  }
}

async function getState(metaData: GoogleDrive.DataFileMataData): Promise<State> {
  if (External.instance.backgroundDownload?.modifiedTime === metaData.modifiedTime) {
    const promise = External.instance.backgroundDownload.promise
    External.instance.backgroundDownload = undefined
    return await promise
  }

  const response = await GoogleDrive.readFile(metaData.id)
  const text = await decompress(await response.arrayBuffer())
  return JSON.parse(text)
}

/**
 * オンメモリのStateとデータフォルダ内のStateを同期する（状況に応じて読み込みや書き込みを行う）。
 * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
 */
async function syncWithDataFolder() {
  try {
    const hadNotOpenedDataFolder = External.instance.dataFolder === undefined
    if (hadNotOpenedDataFolder) {
      const folderHandle = await showDirectoryPicker()
      await folderHandle.requestPermission({ mode: 'readwrite' })
      External.instance.dataFolder = new DataFolder(folderHandle)
    }
    assertNonUndefined(External.instance.dataFolder)

    const lastModified = await External.instance.dataFolder.fetchLastModified()
    if (lastModified === undefined) {
      // データファイルがない場合

      const lastModified = await External.instance.dataFolder.writeState(Internal.instance.state)
      setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
      External.instance.hasUpdatedSinceSync = false
      Rerenderer.instance.rerender()
    } else {
      // データファイルがある場合

      const syncedAt = getSyncedAt(Internal.instance.state.syncWith)
      const knownTimestamp = syncedAt !== undefined ? Number(syncedAt) : -1
      if (knownTimestamp < lastModified) {
        // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
        console.log('syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ')

        const state = await External.instance.dataFolder.readState()
        assertNonUndefined(state)

        // ローカルStateのmaxItemIdの方が大きい場合、ローカルStateの方が「先に進んでいる」と判断する
        dump(state.maxItemId, Internal.instance.state.maxItemId)
        if (state.maxItemId < Internal.instance.state.maxItemId) {
          const lastModified = await External.instance.dataFolder.writeState(
            Internal.instance.state
          )
          setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
          External.instance.hasUpdatedSinceSync = false
          Rerenderer.instance.rerender()
        } else {
          setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
          await restart(state, syncedAt === undefined)
        }
      } else if (knownTimestamp > lastModified) {
        // ユーザーがデータファイルをロールバックさせた場合くらいしか到達しない特殊なケース
        console.log('例外的な状況でしか到達できない特殊なケース')

        const state = await External.instance.dataFolder.readState()
        assertNonUndefined(state)
        setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
        await restart(state)
      } else {
        // データファイルの更新日時がsyncedAtと等しければ
        console.log('データファイルの更新日時がsyncedAtと等しければ')

        // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
        if (!External.instance.hasUpdatedSinceSync) return

        const lastModified = await External.instance.dataFolder.writeState(Internal.instance.state)
        setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      }
    }
  } catch (e) {
    // 何も選ばずピッカーを閉じた際、エラーアラートを出さないようにする
    if (e instanceof Error && e.name === 'AbortError') return

    throw e
  }
}

/**
 * ターゲットItemPathの兄弟リストの中で、現在位置から下端までの項目を選択する。
 * 正確に言うと、ターゲット項目を兄弟リストの末尾に設定する。
 */
export function selectToEndOfList() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const lastSiblingItemId = RArray$.lastOrThrow(siblingItemIds)
  const lastSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, lastSiblingItemId)
  assertNonUndefined(lastSiblingItemPath)
  CurrentState.setTargetItemPathOnly(lastSiblingItemPath)

  // 複数選択中はメインエリア自体をフォーカスする
  focusMainAreaBackground()
}

/**
 * ターゲットItemPathの兄弟リストの中で、現在位置から上端までの項目を選択する。
 * 正確に言うと、ターゲット項目を兄弟リストの先頭に設定する。
 */
export function selectToStartOfList() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, siblingItemIds[0])
  assertNonUndefined(firstSiblingItemPath)
  CurrentState.setTargetItemPathOnly(firstSiblingItemPath)

  // 複数選択中はメインエリア自体をフォーカスする
  focusMainAreaBackground()
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
