import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {DataFolder} from 'src/TreeifyWindow/Internal/DataFolder'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {cleanup, startup} from 'src/TreeifyWindow/startup'
import {State} from 'src/TreeifyWindow/Internal/State'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'

/** データフォルダピッカーを開く */
export function openDataFolderPicker() {
  doAsyncWithErrorHandling(async () => {
    const folderHandle = await showDirectoryPicker()
    await folderHandle.requestPermission({mode: 'readwrite'})
    const dataFolder = new DataFolder(folderHandle)
    const state = Chunk.inflateStateFromChunks(await dataFolder.readAllChunks())
    await cleanup()
    // ↑のcleanup()によってExternal.instance.dataFolderはリセットされるので、このタイミングで設定する
    External.instance.dataFolder = dataFolder
    await startup(state as State)
  })
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から下端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの末尾に設定する。
 */
export function selectAllBelowItems() {
  const targetItemPath = NextState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const lastSiblingItemId: ItemId = NextState.getChildItemIds(parentItemId).last()
  const lastSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, lastSiblingItemId)
  assertNonUndefined(lastSiblingItemPath)
  NextState.setTargetItemPathOnly(lastSiblingItemPath)

  // 複数選択中はターゲットアイテムからフォーカスを外す
  document.getElementById('item-tree')?.focus()
}

/**
 * ターゲットアイテムパスの兄弟リストの中で、現在位置から上端までのアイテムを選択する。
 * 正確に言うと、ターゲットアイテムを兄弟リストの先頭に設定する。
 */
export function selectAllAboveItems() {
  const targetItemPath = NextState.getTargetItemPath()
  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const firstSiblingItemId: ItemId = NextState.getChildItemIds(parentItemId).first()
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, firstSiblingItemId)
  assertNonUndefined(firstSiblingItemPath)
  NextState.setTargetItemPathOnly(firstSiblingItemPath)

  // 複数選択中はターゲットアイテムからフォーカスを外す
  document.getElementById('item-tree')?.focus()
}
