import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {External} from 'src/TreeifyWindow/External/External'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {cleanup, startup} from 'src/TreeifyWindow/startup'

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
        await startup(state as State)
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
      await startup(state as State)
    }
  } else {
    const unknownUpdatedDeviceId = await External.instance.dataFolder.findUnknownUpdatedDevice()
    if (unknownUpdatedDeviceId === undefined) {
      // もし自身の知らない他デバイスの更新がなければ（つまり最も単純な自デバイスフォルダ上書き更新のケース）

      // 変化のあったチャンクをデータベースに書き込む
      const chunks = []
      for (const chunkId of Chunk.extractChunkIds(External.instance.pendingMutatedPropertyPaths)) {
        const chunk = Chunk.create(Internal.instance.state, chunkId)
        chunks.push(chunk)
      }
      External.instance.pendingMutatedPropertyPaths.clear()
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
      await startup(state as State)
    }
  }
  CurrentState.commit()
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から下端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの末尾に設定する。
 */
export function selectAllBelowItems() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const lastSiblingItemId: ItemId = siblingItemIds.last()
  const lastSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, lastSiblingItemId)
  assertNonUndefined(lastSiblingItemPath)
  CurrentState.setTargetItemPathOnly(lastSiblingItemPath)

  // 複数選択中はターゲットアイテムからフォーカスを外す
  document.querySelector<HTMLElement>('.item-tree')?.focus()
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から上端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの先頭に設定する。
 */
export function selectAllAboveItems() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const firstSiblingItemId: ItemId = siblingItemIds.first()
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, firstSiblingItemId)
  assertNonUndefined(firstSiblingItemPath)
  CurrentState.setTargetItemPathOnly(firstSiblingItemPath)

  // 複数選択中はターゲットアイテムからフォーカスを外す
  document.querySelector<HTMLElement>('.item-tree')?.focus()
}

/** トランスクルードするために独自クリップボードに情報を書き込む */
export function copyForTransclusion() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  External.instance.treeifyClipboard = {selectedItemPaths}
}
