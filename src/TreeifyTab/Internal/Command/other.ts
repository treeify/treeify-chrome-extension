import { List } from 'immutable'
import { ItemId, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { CURRENT_SCHEMA_VERSION, DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { focusMainAreaBackground } from 'src/TreeifyTab/External/domTextSelection'
import { External } from 'src/TreeifyTab/External/External'
import { GoogleDrive } from 'src/TreeifyTab/External/GoogleDrive'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { getSyncedAt, setSyncedAt } from 'src/TreeifyTab/Persistent/sync'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { restart } from 'src/TreeifyTab/startup'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { dump } from 'src/Utility/Debug/logger'
import { compress, decompress } from 'src/Utility/gzip'
import DataFileMataData = GoogleDrive.DataFileMataData

export async function syncTreeifyData() {
  switch (Internal.instance.state.syncWith) {
    case 'Google Drive':
      await syncWithGoogleDrive()
      break
    case 'Local':
      await syncWithDataFolder()
      break
  }
}

async function syncWithGoogleDrive() {
  const DATA_FILE_NAME = 'Treeify data.json.gz'

  const dataFiles = await GoogleDrive.searchFile(DATA_FILE_NAME)
  // タイムスタンプが最新のデータファイルを選ぶ。
  // 複数が該当する場合はIDのソート順で先頭のものを選ぶ。
  const dataFile = List(dataFiles)
    .sortBy((dataFile) => dataFile.id)
    .maxBy((dataFile) => dataFile.modifiedTime)
  // TODO: リリースする前にログ出力を削除する
  dump(dataFile)
  if (dataFile === undefined) {
    // データファイルがない場合
    console.log('データファイルがない場合')

    console.log('create APIを呼んでファイル更新日時を記録して終了')
    // create APIを呼んでファイル更新日時を記録して終了
    const gzipped = await compress(JSON.stringify(Internal.instance.state, State.jsonReplacer))
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
    const dataFileTimestamp = new Date(dataFile.modifiedTime).getTime()
    if (knownTimestamp < dataFileTimestamp) {
      // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
      console.log('syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ')

      // get APIでファイル内容をダウンロードする
      const state: State = await getState(dataFile)

      // ローカルStateのmaxItemIdの方が大きい場合、ローカルStateの方が「先に進んでいる」と判断する
      dump(state.maxItemId, Internal.instance.state.maxItemId)
      if (state.maxItemId < Internal.instance.state.maxItemId) {
        const gzipped = await compress(JSON.stringify(Internal.instance.state, State.jsonReplacer))
        const response = await GoogleDrive.updateFileWithMultipart(dataFile.id, new Blob(gzipped))
        const responseJson = await response.json()
        setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      } else {
        setSyncedAt(Internal.instance.state.syncWith, dataFile.modifiedTime)
        await restart(state, syncedAt === undefined)
      }
    } else if (knownTimestamp > dataFileTimestamp) {
      // 例外的な状況でしか到達できない特殊なケース。
      // 起こるとしたら下記の2パターンか。
      // (1) ユーザーが履歴機能を使ってデータファイルをロールバックさせた
      // (2) 複数のオンラインストレージを併用しており、過去に使っていたオンラインストレージと同期した
      // データファイルが壊れたユーザーが復元を試みるとパターン(1)になる。
      console.log('例外的な状況でしか到達できない特殊なケース')

      const state: State = await getState(dataFile)
      setSyncedAt(Internal.instance.state.syncWith, dataFile.modifiedTime)
      await restart(state)
    } else {
      // データファイルの更新日時がsyncedAtと等しければ
      console.log('データファイルの更新日時がsyncedAtと等しければ')

      // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
      if (!External.instance.hasUpdatedSinceSync) return

      const gzipped = await compress(JSON.stringify(Internal.instance.state, State.jsonReplacer))
      const response = await GoogleDrive.updateFileWithMultipart(dataFile.id, new Blob(gzipped))
      const responseJson = await response.json()
      setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
      External.instance.hasUpdatedSinceSync = false
      Rerenderer.instance.rerender()
    }
  }
}

async function getState(metaData: DataFileMataData): Promise<State> {
  if (External.instance.backgroundDownload?.modifiedTime === metaData.modifiedTime) {
    const promise = External.instance.backgroundDownload.promise
    External.instance.backgroundDownload = undefined
    return await promise
  }

  const response = await GoogleDrive.readFile(metaData.id)
  const text = await decompress(await response.arrayBuffer())
  const state: State = JSON.parse(text, State.jsonReviver)
  return state
}

/**
 * オンメモリのStateとデータフォルダ内のStateを同期する（状況に応じて読み込みや書き込みを行う）。
 * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
 */
async function syncWithDataFolder() {
  try {
    const hadNotOpenedDataFolder = External.instance.dataFolder === undefined
    if (hadNotOpenedDataFolder) {
      const folderHandle = await pickDataFolder()
      External.instance.dataFolder = new DataFolder(folderHandle)
    }
    assertNonUndefined(External.instance.dataFolder)

    const unknownUpdatedInstanceId = await External.instance.dataFolder.findUnknownUpdatedInstance()

    if (unknownUpdatedInstanceId === undefined) {
      // もし自身の知らない他インスタンスの更新がなければ

      if (hadNotOpenedDataFolder) {
        // メモリ上のStateを自インスタンスフォルダに書き込む
        await External.instance.dataFolder.writeState(Internal.instance.state)
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      } else {
        // 自インスタンスフォルダ上書き更新のケース

        External.instance.hasUpdatedSinceSync = false
        await External.instance.dataFolder.writeState(Internal.instance.state)
        Rerenderer.instance.rerender()
      }
    } else {
      // もし自身の知らない他インスタンスの更新があれば

      const instanceFile = await External.instance.dataFolder.readInstanceFile(
        unknownUpdatedInstanceId
      )
      assertNonUndefined(instanceFile)

      if (instanceFile.schemaVersion > CURRENT_SCHEMA_VERSION) {
        alert('拡張機能をバージョンアップしてください')
      } else {
        await External.instance.dataFolder.copyFrom(instanceFile)
        await restart(instanceFile.state, hadNotOpenedDataFolder)
      }
    }
  } catch (e) {
    // 何も選ばずピッカーを閉じた際、エラーアラートを出さないようにする
    if (e instanceof Error && e.name === 'AbortError') return

    throw e
  }
}

/**
 * ユーザーにデータフォルダを選択させ、そのハンドルを返す。
 * ただしユーザーが選択したフォルダにTreeifyとは無関係なファイルなどが入っている場合は「Treeify data」というフォルダを作り、そのハンドルを返す。
 * Treeify dataフォルダが既に存在する場合、そのフォルダを返す。
 */
async function pickDataFolder(): Promise<FileSystemDirectoryHandle> {
  const folderHandle = await showDirectoryPicker()
  await folderHandle.requestPermission({ mode: 'readwrite' })

  if (await DataFolder.isDataFolder(folderHandle)) {
    return folderHandle
  }

  return await folderHandle.getDirectoryHandle('Treeify data', { create: true })
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
  const lastSiblingItemId: ItemId = siblingItemIds.last()
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
  const firstSiblingItemId: ItemId = siblingItemIds.first()
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, firstSiblingItemId)
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
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId).toSet().delete(TOP_ITEM_ID)
  const excludedItemIds = CurrentState.getExcludedItemIds().toSet()

  // いわゆるxorのメソッドが見当たらないので同等の処理をする
  const union = selectedItemIds.union(excludedItemIds)
  const intersection = selectedItemIds.intersect(excludedItemIds)
  CurrentState.setExcludedItemIds(union.subtract(intersection).toList())
}

/**
 * 役割は2つ。
 * ・特定のキー入力でのブラウザのデフォルト動作を阻止するために割り当てる（preventDefaultが呼ばれるので）
 * ・キーボード操作設定ダイアログでキーバインドを追加した際の無難な初期値
 */
export function doNothing() {}
