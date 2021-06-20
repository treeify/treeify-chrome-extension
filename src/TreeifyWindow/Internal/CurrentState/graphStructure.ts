import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'

/**
 * 全ての子孫と自身のアイテムIDを返す。
 * ただし（折りたたみなどの理由で）表示されないアイテムはスキップする。
 */
export function* getAllDisplayingItemIds(state: State, itemPath: ItemPath): Generator<ItemId> {
  yield ItemPath.getItemId(itemPath)
  for (const childItemId of CurrentState.getDisplayingChildItemIds(itemPath)) {
    yield* getAllDisplayingItemIds(state, itemPath.push(childItemId))
  }
}

/** 与えられたアイテムパスがアイテムツリー上で表示されるべきものかどうかを判定する */
export function isVisible(itemPath: ItemPath): boolean {
  for (let i = 1; i < itemPath.size - 1; i++) {
    const displayingChildItemIds = CurrentState.getDisplayingChildItemIds(itemPath.take(i))
    const nextItemId = itemPath.get(i + 1)
    assertNonUndefined(nextItemId)
    if (!displayingChildItemIds.contains(nextItemId)) {
      return false
    }
  }
  return true
}

/**
 * 指定されたアイテムが所属するページまでのItemPathを返す。
 * 自身がページの場合は自身のItemPathを返す。
 */
export function yieldItemPaths(itemId: ItemId): Generator<ItemPath> {
  return _yieldItemPaths(List.of(itemId))
}

function* _yieldItemPaths(itemPath: ItemPath): Generator<ItemPath> {
  const rootItemId = ItemPath.getRootItemId(itemPath)
  if (CurrentState.isPage(rootItemId)) {
    yield itemPath
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(rootItemId)) {
    yield* _yieldItemPaths(itemPath.unshift(parentItemId))
  }
}

/**
 * 指定されたアイテムを起点とするサブツリーに含まれるアイテムIDを全て返す。
 * ただしページは終端ノードとして扱い、その子孫は無視する。
 */
export function* getSubtreeItemIds(itemId: ItemId): Generator<ItemId> {
  yield itemId

  // ページは終端ノードとして扱う
  if (CurrentState.isPage(itemId)) return

  for (const childItemId of Internal.instance.state.items[itemId].childItemIds) {
    yield* getSubtreeItemIds(childItemId)
  }
}

/**
 * 全ての先祖アイテムを返す。
 * トランスクルージョンによって枝分かれしていても、全ての枝をトップページまで辿る。
 * そのため重複することがある。
 */
export function* yieldAncestorItemIds(itemId: ItemId): Generator<ItemId> {
  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield parentItemId
    yield* yieldAncestorItemIds(parentItemId)
  }
}
