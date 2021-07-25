import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyTab/basicType'
import {DataFolder} from 'src/TreeifyTab/External/DataFolder'
import {focusMainAreaBackground} from 'src/TreeifyTab/External/domTextSelection'
import {External} from 'src/TreeifyTab/External/External'
import {Chunk} from 'src/TreeifyTab/Internal/Chunk'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {restart} from 'src/TreeifyTab/startup'

/**
 * データフォルダに現在の状態を書き込む。
 * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
 */
export async function saveToDataFolder() {
  if (External.instance.dataFolder === undefined) {
    const folderHandle = await showDirectoryPicker()
    await folderHandle.requestPermission({mode: 'readwrite'})
    External.instance.dataFolder = new DataFolder(folderHandle)
    const unknownUpdatedInstanceId = await External.instance.dataFolder.findUnknownUpdatedInstance()
    if (unknownUpdatedInstanceId === undefined) {
      // もし自身の知らない他インスタンスの更新がなければ

      const chunks = await External.instance.dataFolder.readAllChunks()
      if (chunks.isEmpty()) {
        // 自インスタンスフォルダが無い場合

        // メモリ上のStateを自インスタンスフォルダに書き込む
        const allChunks = Chunk.createAllChunks(Internal.instance.state)
        await External.instance.dataFolder.writeChunks(allChunks)
      } else {
        // 自インスタンスフォルダの内容からStateを読み込んで事実上の再起動を行う
        const state = Chunk.inflateStateFromChunks(chunks)
        await restart(state)
      }
    } else {
      // もし自身の知らない他インスタンスの更新があれば
      await External.instance.dataFolder.copyFrom(unknownUpdatedInstanceId)

      const chunks = await External.instance.dataFolder.readAllChunks()
      const state = Chunk.inflateStateFromChunks(chunks)
      await restart(state)
    }
  } else {
    const unknownUpdatedInstanceId = await External.instance.dataFolder.findUnknownUpdatedInstance()
    if (unknownUpdatedInstanceId === undefined) {
      // もし自身の知らない他インスタンスの更新がなければ（つまり最も単純な自インスタンスフォルダ上書き更新のケース）

      // 変化のあったチャンクをデータベースに書き込む
      const chunks = []
      for (const chunkId of External.instance.pendingMutatedChunkIds) {
        const chunk = Chunk.create(Internal.instance.state, chunkId)
        chunks.push(chunk)
      }
      External.instance.pendingMutatedChunkIds.clear()
      await External.instance.dataFolder.writeChunks(List(chunks))
      Rerenderer.instance.rerender()
    } else {
      // もし自身の知らない他インスタンスの更新があれば
      await External.instance.dataFolder.copyFrom(unknownUpdatedInstanceId)

      const chunks = await External.instance.dataFolder.readAllChunks()
      const state = Chunk.inflateStateFromChunks(chunks)
      await restart(state)
    }
  }
}

/**
 * ターゲットItemPathの兄弟リストの中で、現在位置から下端までの項目を選択する。
 * 正確に言うと、ターゲット項目を兄弟リストの末尾に設定する。
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

  // 複数選択中はメインエリア自体をフォーカスする
  focusMainAreaBackground()
}

/**
 * ターゲットItemPathの兄弟リストの中で、現在位置から上端までの項目を選択する。
 * 正確に言うと、ターゲット項目を兄弟リストの先頭に設定する。
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

export function doNothing() {}
