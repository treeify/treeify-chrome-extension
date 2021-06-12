import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyWindow/basicType'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {focusItemTreeBackground} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {cleanup, startup} from 'src/TreeifyWindow/startup'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {get} from 'svelte/store'

/**
 * データフォルダに現在の状態を書き込む。
 * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
 */
export async function saveToDataFolder() {
  if (External.instance.dataFolder === undefined) {
    const folderHandle = await showDirectoryPicker()
    await folderHandle.requestPermission({mode: 'readwrite'})
    External.instance.dataFolder = new DataFolder(folderHandle)
    const unknownUpdatedDeviceId = await External.instance.dataFolder.findUnknownUpdatedDevice()
    if (unknownUpdatedDeviceId === undefined) {
      // もし自身の知らない他デバイスの更新がなければ

      const chunks = await External.instance.dataFolder.readAllChunks()
      if (chunks.isEmpty()) {
        // 自デバイスフォルダが無い場合

        // メモリ上のStateを自デバイスフォルダに書き込む
        const allChunks = Chunk.createAllChunks(Internal.instance.state)
        const filtered = allChunks.filter((chunks) => chunks !== undefined) as List<Chunk>
        await External.instance.dataFolder.writeChunks(filtered)
      } else {
        // 自デバイスフォルダの内容からStateを読み込んで事実上の再起動を行う
        const state = Chunk.inflateStateFromChunks(chunks)
        const dataFolder = External.instance.dataFolder
        await cleanup()
        // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
        External.instance.dataFolder = dataFolder
        await startup(state)
      }
    } else {
      // もし自身の知らない他デバイスの更新があれば
      await External.instance.dataFolder.copyFrom(unknownUpdatedDeviceId)

      const chunks = await External.instance.dataFolder.readAllChunks()
      const state = Chunk.inflateStateFromChunks(chunks)
      const dataFolder = External.instance.dataFolder
      await cleanup()
      // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
      External.instance.dataFolder = dataFolder
      await startup(state)
    }
  } else {
    const unknownUpdatedDeviceId = await External.instance.dataFolder.findUnknownUpdatedDevice()
    if (unknownUpdatedDeviceId === undefined) {
      // もし自身の知らない他デバイスの更新がなければ（つまり最も単純な自デバイスフォルダ上書き更新のケース）

      // 変化のあったチャンクをデータベースに書き込む
      const chunks = []
      for (const chunkId of External.instance.pendingMutatedChunkIds) {
        const chunk = Chunk.create(Internal.instance.state, chunkId)
        chunks.push(chunk)
      }
      External.instance.pendingMutatedChunkIds.clear()
      await External.instance.dataFolder.writeChunks(List(chunks))
    } else {
      // もし自身の知らない他デバイスの更新があれば
      await External.instance.dataFolder.copyFrom(unknownUpdatedDeviceId)

      const chunks = await External.instance.dataFolder.readAllChunks()
      const state = Chunk.inflateStateFromChunks(chunks)
      const dataFolder = External.instance.dataFolder
      await cleanup()
      // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
      External.instance.dataFolder = dataFolder
      await startup(state)
    }
  }
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から下端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの末尾に設定する。
 */
export function selectAllBelowItems() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = get(Internal.instance.state.items[parentItemId].childItemIds)
  const lastSiblingItemId: ItemId = siblingItemIds.last()
  const lastSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, lastSiblingItemId)
  assertNonUndefined(lastSiblingItemPath)
  CurrentState.setTargetItemPathOnly(lastSiblingItemPath)

  // 複数選択中はアイテムツリー自体をフォーカスする
  focusItemTreeBackground()
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から上端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの先頭に設定する。
 */
export function selectAllAboveItems() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = get(Internal.instance.state.items[parentItemId].childItemIds)
  const firstSiblingItemId: ItemId = siblingItemIds.first()
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, firstSiblingItemId)
  assertNonUndefined(firstSiblingItemPath)
  CurrentState.setTargetItemPathOnly(firstSiblingItemPath)

  // 複数選択中はアイテムツリー自体をフォーカスする
  focusItemTreeBackground()
}

/** トランスクルードするために独自クリップボードに情報を書き込む */
export async function copyForTransclusion() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  External.instance.treeifyClipboard = {selectedItemPaths}

  // 「独自クリップボードにコピー→他アプリで何かをコピー→Treeify上でペースト」としたとき、
  // 本来なら他アプリ由来のデータが貼り付けられるべきなのに独自クリップボードが優先されてしまう問題の対策。
  // クリップボードが上書きされたことを検出するために独自クリップボードのハッシュ値をクリップボードに書き込む。
  const treeifyClipboardHash = External.instance.getTreeifyClipboardHash()
  assertNonUndefined(treeifyClipboardHash)
  const blob = new Blob([treeifyClipboardHash], {type: 'text/plain'})
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])
}

/**
 * ターゲットアイテムをワークスペースの除外アイテムリストに入れる。
 * ただしトップページは除外できない。
 */
export function excludeFromCurrentWorkspace() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId).toSet().delete(TOP_ITEM_ID)
  const excludedItemIds = get(CurrentState.getExcludedItemIds()).toSet()
  CurrentState.setExcludedItemIds(selectedItemIds.union(excludedItemIds).toList())
}

/** デュアルウィンドウモードにする */
export async function toDualWindowMode() {
  await TreeifyWindow.toDualWindowMode()
}
