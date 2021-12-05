import { ItemId, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { focusMainAreaBackground } from 'src/TreeifyTab/External/domTextSelection'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { restart } from 'src/TreeifyTab/startup'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { dump } from 'src/Utility/Debug/logger'

/**
 * オンメモリのStateとデータフォルダ内のStateを同期する（状況に応じて読み込みや書き込みを行う）。
 * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
 */
export async function syncWithDataFolder() {
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
        External.instance.alreadyWrittenToDataFolder = true
        Rerenderer.instance.rerender()
      } else {
        // 自インスタンスフォルダ上書き更新のケース

        External.instance.alreadyWrittenToDataFolder = true
        await External.instance.dataFolder.writeState(Internal.instance.state)
        Rerenderer.instance.rerender()
      }
    } else {
      // もし自身の知らない他インスタンスの更新があれば

      switch (await External.instance.dataFolder.checkInstanceFolder(unknownUpdatedInstanceId)) {
        case 'success':
          await External.instance.dataFolder.copyFrom(unknownUpdatedInstanceId)

          const instanceFile = await External.instance.dataFolder.readInstanceFile()
          assertNonUndefined(instanceFile)
          await restart(instanceFile.state, hadNotOpenedDataFolder)
          break
        case 'incomplete':
          alert(
            '他デバイスのデータに整合性がないため読み込めません。\nオンラインストレージ等でデータフォルダを共有している場合は、同期が未完了だと考えられます。'
          )
          break
        case 'unknown version':
          alert('拡張機能をバージョンアップしてください')
          break
      }
    }
  } catch (e) {
    // TODO: デバッグ用の仕込みなのでリリースまでに削除すべき
    alert('データフォルダ同期時の例外のキャッチに成功\n' + e)
    if (e instanceof Error) {
      dump(e.stack)
    } else {
      dump(e)
    }

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

export function doNothing() {}
