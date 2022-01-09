import { Set } from 'immutable'
import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { focusMainAreaBackground } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { Option, Rist } from 'src/Utility/fp-ts'

export function syncTreeifyData() {
  const syncButton = document.querySelector<HTMLElement>('.sync-button_root')
  if (syncButton !== null) {
    syncButton.click()
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
  const lastSiblingItemId = Option.getOrThrow(Rist.last(siblingItemIds))
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
  const selectedItemIds = Set(selectedItemPaths.map(ItemPath.getItemId)).delete(TOP_ITEM_ID)
  const excludedItemIds = Set(CurrentState.getExcludedItemIds())

  // いわゆるxorのメソッドが見当たらないので同等の処理をする
  const union = selectedItemIds.union(excludedItemIds)
  const intersection = selectedItemIds.intersect(excludedItemIds)
  CurrentState.setExcludedItemIds(union.subtract(intersection).toArray())
}

/**
 * 役割は2つ。
 * ・特定のキー入力でのブラウザのデフォルト動作を阻止するために割り当てる（preventDefaultが呼ばれるので）
 * ・キーボード操作設定ダイアログでキーバインドを追加した際の無難な初期値
 */
export function doNothing() {}
