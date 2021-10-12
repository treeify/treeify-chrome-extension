import {List, Seq, Set} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {MutableOrderedTree} from 'src/Common/OrderedTree'
import {ItemId} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'

/**
 * 全ての子孫と自身の項目IDを返す。
 * ただし（折りたたみなどの理由で）表示されない項目はスキップする。
 */
export function* getAllDisplayingItemIds(state: State, itemPath: ItemPath): Generator<ItemId> {
  yield ItemPath.getItemId(itemPath)
  for (const childItemId of CurrentState.getDisplayingChildItemIds(itemPath)) {
    yield* getAllDisplayingItemIds(state, itemPath.push(childItemId))
  }
}

/** 与えられたItemPathがメインエリア上で表示されるべきものかどうかを判定する */
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
 * 指定された項目が所属するページまでのItemPathを返す。
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
 * 指定された項目が所属するページIDの集合を返す。
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
 * 指定された項目を起点とするサブツリーに含まれる項目IDを全て返す。
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
 * 全ての先祖項目を返す。
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
 * 指定された項目のサブツリーに対応するロード状態のタブを数える。
 * ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
 */
export function countLoadedTabsInSubtree(state: State, itemId: ItemId): integer {
  return Set(CurrentState.getSubtreeItemIds(itemId)).filter(
    (itemId) => !External.instance.tabItemCorrespondence.isUnloaded(itemId)
  ).size
}

/**
 * 指定された項目のサブツリーに対応するタブを数える。
 * ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
 */
export function countTabsInSubtree(state: State, itemId: ItemId): integer {
  return Set(CurrentState.getSubtreeItemIds(itemId)).filter(
    (itemId) => External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined
  ).size
}

/**
 * 与えられたItemPath群をドキュメント順でソートする。
 * 全てのItemPathのルート項目が同じでなければ正しく計算できない。
 */
export function sortByDocumentOrder(itemPaths: List<ItemPath>): List<ItemPath> {
  return itemPaths.sortBy((itemPath) => {
    return toSiblingRankList(itemPath)
  }, lexicographicalOrder)
}

// ItemPathを兄弟順位リストに変換する
function toSiblingRankList(itemPath: ItemPath): List<integer> {
  const siblingRankArray = []
  for (let i = 1; i < itemPath.size; i++) {
    const childItemIds = Internal.instance.state.items[itemPath.get(i - 1)!].childItemIds
    siblingRankArray.push(childItemIds.indexOf(itemPath.get(i)!))
  }
  return List(siblingRankArray)
}

// 辞書式順序のcomparator
function lexicographicalOrder(lhs: List<integer>, rhs: List<integer>): integer {
  const min = Math.min(lhs.size, rhs.size)

  for (let i = 0; i < min; i++) {
    const r = rhs.get(i)!
    const l = lhs.get(i)!
    if (l > r) {
      return 1
    } else if (l < r) {
      return -1
    }
  }
  if (lhs.size === rhs.size) {
    return 0
  } else if (lhs.size > rhs.size) {
    return 1
  } else {
    return -1
  }
}

/**
 * 項目群をグラフ構造に従って順序ツリー化する。
 * トランスクルードによって同一項目が複数箇所に出現する場合がある。
 */
export function treeify(itemIdSet: Set<ItemId>, rootItemId: ItemId): MutableOrderedTree<ItemId> {
  const childrenMap = itemIdSet
    .flatMap((itemId) => yieldItemPathsFor(List.of(itemId), itemIdSet))
    .groupBy((value) => ItemPath.getRootItemId(value))
    .map((collection) => CurrentState.sortByDocumentOrder(collection.toList()))

  return _treeify(childrenMap, rootItemId)
}

/**
 * treeify関数用のヘルパー関数。
 * 第1引数を先祖方向に探索し、第2引数に含まれる項目に到達したら、スタート地点からその項目までのItemPathを返す。
 * @param itemIds アキュムレーター引数。長さは必ず1以上。
 * @param itemIdSet 探索の終端となる項目ID群
 */
function* yieldItemPathsFor(itemIds: List<ItemId>, itemIdSet: Set<ItemId>): Generator<ItemPath> {
  const itemId = itemIds.first(undefined)
  assertNonUndefined(itemId)

  if (itemIds.size > 1 && itemIdSet.contains(itemId)) {
    yield itemIds
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield* yieldItemPathsFor(itemIds.unshift(parentItemId), itemIdSet)
  }
}

function _treeify(
  childrenMap: Seq.Keyed<ItemId, List<ItemPath>>,
  itemId: ItemId
): MutableOrderedTree<ItemId> {
  const children = childrenMap.get(itemId) ?? List.of()
  return new MutableOrderedTree(
    itemId,
    children.map((child) => _treeify(childrenMap, ItemPath.getItemId(child))).toArray()
  )
}
