import {List, Set} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {External} from 'src/TreeifyWindow/External/External'
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

/** 与えられたアイテムパスがメインエリア上で表示されるべきものかどうかを判定する */
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
 * 指定されたアイテムが所属するページIDの集合を返す。
 * 自身がページの場合は自身のみを返す。
 */
export function getPageIdsBelongingTo(itemId: ItemId): Set<ItemId> {
  return Set(yieldItemPaths(itemId)).map((itemPath) => ItemPath.getRootItemId(itemPath))
}

/** 指定されたページが所属するページIDの集合を返す */
export function getParentPageIds(pageId: ItemId): Set<ItemId> {
  return CurrentState.getParentItemIds(pageId)
    .flatMap((parentItemId) => CurrentState.getPageIdsBelongingTo(parentItemId))
    .toSet()
}

/**
 * 指定されたアイテムを起点とするサブツリーに含まれるアイテムIDを全て返す。
 * ただしページは終端ノードとして扱い、その子孫は無視する。
 */
export function* getSubtreeItemIds(itemId: ItemId): Generator<ItemId> {
  yield itemId

  for (const childItemId of Internal.instance.state.items[itemId].childItemIds) {
    if (CurrentState.isPage(childItemId)) {
      // ページは終端ノードとして扱う
      yield childItemId
    } else {
      yield* getSubtreeItemIds(childItemId)
    }
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

/**
 * 指定されたアイテムのサブツリーに対応するロード状態のタブを数える。
 * ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
 */
export function countLoadedTabsInSubtree(state: State, itemId: ItemId): integer {
  return Set(CurrentState.getSubtreeItemIds(itemId)).filter(
    (itemId) => !External.instance.tabItemCorrespondence.isUnloaded(itemId)
  ).size
}

/**
 * 指定されたアイテムのサブツリーに対応するタブを数える。
 * ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
 */
export function countTabsInSubtree(state: State, itemId: ItemId): integer {
  return Set(CurrentState.getSubtreeItemIds(itemId)).filter(
    (itemId) => External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined
  ).size
}
