import {is, List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {Derived} from 'src/TreeifyWindow/Internal/Derived/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {get, join} from 'src/TreeifyWindow/svelte'
import {derived, Readable} from 'svelte/store'

/** 与えられたアイテムがアイテムツリー上で表示する子アイテムのリストを返す */
export function getDisplayingChildItemIds(itemPath: ItemPath): Readable<List<ItemId>> {
  const itemId = ItemPath.getItemId(itemPath)
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  // アクティブページはisCollapsedフラグの状態によらず子を強制的に表示する
  if (itemPath.size === 1) {
    return childItemIds
  }

  const isCollapsed = Derived.getIsCollapsed(itemPath)
  const isPage = Derived.isPage(itemId)
  return derived([childItemIds, isCollapsed, isPage], () => {
    if (get(isCollapsed) || get(isPage)) {
      return List.of<ItemId>()
    } else {
      return get(childItemIds)
    }
  })
}

/**
 * 指定されたアイテムのisCollapsedフラグを返す。
 * 親アイテムに依存するのでItemIdではなくItemPathを取る。
 * TODO: 親のないItemPathを与えられた際の挙動を修正するかコメントに書く
 */
export function getIsCollapsed(itemPath: ItemPath): Readable<boolean> {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  return Internal.instance.state.items[itemId].parents[parentItemId].isCollapsed
}

/**
 * 指定されたアイテムパスの最後のエッジのラベルを返す。
 * 親を持たないアイテムパスの場合、undefinedを返す。
 */
export function getLabels(itemPath: ItemPath): Readable<List<string>> | undefined {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  if (parentItemId !== undefined) {
    return Internal.instance.state.items[itemId].parents[parentItemId].labels
  } else {
    return undefined
  }
}

/** 現在のワークスペースの除外アイテムリストを返す */
export function getExcludedItemIds(): Readable<List<ItemId>> {
  // この関数の呼び出し時点のカレントワークスペースのexcludedItemIdsを返すだけではダメ。
  // ワークスペースが切り替えられたときに、参照先のexcludedItemIdsを切り替えなければならない。
  // 依存先が動的に変化するということなので、derived関数では実現できない（はず）。
  // より高度なユーティリティ関数を用いて実装した。

  const currentWorkspaceId = Internal.instance.getCurrentWorkspaceId()
  const nestedStore = derived(currentWorkspaceId, (currentWorkspaceId) => {
    return Internal.instance.state.workspaces[currentWorkspaceId].excludedItemIds
  })
  return join(nestedStore)
}

/** アイテムを複数選択中かどうかを返す */
export function isMultiSelected(): Readable<boolean> {
  const targetItemPath = Derived.getTargetItemPath()
  const anchorItemPath = Derived.getAnchorItemPath()

  return derived([targetItemPath, anchorItemPath], ([targetItemPath, anchorItemPath]) => {
    return !is(targetItemPath, anchorItemPath)
  })
}
