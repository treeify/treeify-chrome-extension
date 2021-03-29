import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {cleanup, startup} from 'src/TreeifyWindow/startup'
import {State} from 'src/TreeifyWindow/Internal/State'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {List} from 'immutable'

/** データフォルダピッカーを開く */
export function openDataFolderPicker() {
  doAsyncWithErrorHandling(async () => {
    const folderHandle = await showDirectoryPicker()
    await folderHandle.requestPermission({mode: 'readwrite'})
    const dataFolder = new DataFolder(folderHandle)

    await dataFolder.sync()

    const chunks = await dataFolder.readAllChunks()
    if (!chunks.isEmpty()) {
      const state = Chunk.inflateStateFromChunks(chunks)
      await cleanup()
      // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
      External.instance.dataFolder = dataFolder
      await startup(state as State)
    } else {
      const allChunks = Chunk.createAllChunks(Internal.instance.state)
      const filtered = allChunks.filter((chunks) => chunks !== undefined) as List<Chunk>
      await dataFolder.writeChunks(filtered)
      External.instance.dataFolder = dataFolder
    }
  })
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
  document.getElementById('item-tree')?.focus()
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
  document.getElementById('item-tree')?.focus()
}
