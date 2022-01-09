import { pipe } from 'fp-ts/function'
import { Ord as NumberOrd } from 'fp-ts/number'
import { List, Seq, Set } from 'immutable'
import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray, RArray$, RSet, RSet$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'
import { MutableOrderedTree } from 'src/Utility/OrderedTree'

/**
 * 全ての子孫と自身の項目IDを返す。
 * ただし（折りたたみなどの理由で）表示されない項目はスキップする。
 */
export function* getAllDisplayingItemIds(state: State, itemPath: ItemPath): Generator<ItemId> {
  yield ItemPath.getItemId(itemPath)
  for (const childItemId of CurrentState.getDisplayingChildItemIds(itemPath)) {
    yield* getAllDisplayingItemIds(state, RArray$.append(childItemId)(itemPath))
  }
}

/** 与えられたItemPathがメインエリア上で表示されるべきものかどうかを判定する */
export function isVisible(itemPath: ItemPath): boolean {
  for (let i = 1; i < itemPath.length - 1; i++) {
    const displayingChildItemIds = pipe(
      itemPath,
      RArray$.takeLeft(i),
      CurrentState.getDisplayingChildItemIds
    )
    const nextItemId = itemPath[i + 1]
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
  return _yieldItemPaths([itemId])
}

function* _yieldItemPaths(itemPath: ItemPath): Generator<ItemPath> {
  const rootItemId = ItemPath.getRootItemId(itemPath)
  if (CurrentState.isPage(rootItemId)) {
    yield itemPath
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(rootItemId)) {
    yield* _yieldItemPaths(RArray$.prepend(parentItemId)(itemPath))
  }
}

/**
 * 指定された項目が所属するページIDの集合を返す。
 * 自身がページの場合は自身のみを返す。
 */
export function getPageIdsBelongingTo(itemId: ItemId): RSet<ItemId> {
  return pipe(
    RSet$.from(yieldItemPaths(itemId)),
    RSet$.map((itemPath) => ItemPath.getRootItemId(itemPath))
  )
}

/** 指定されたページが所属するページIDを返す */
export function getParentPageIds(pageId: ItemId): RArray<ItemId> {
  return pipe(
    RSet$.from(CurrentState.getParentItemIds(pageId)),
    RSet$.flatMap((parentItemId: ItemId) => CurrentState.getPageIdsBelongingTo(parentItemId)),
    RArray$.from
  )
}

/**
 * 指定された項目を起点とするサブツリーに含まれる項目IDを全て返す。
 * ただしページは終端ノードとして扱い、その子孫は無視する。
 */
export function* yieldSubtreeItemIdsShallowly(itemId: ItemId): Generator<ItemId> {
  yield itemId

  for (const childItemId of Internal.instance.state.items[itemId].childItemIds) {
    if (CurrentState.isPage(childItemId)) {
      // ページは終端ノードとして扱う
      yield childItemId
    } else {
      yield* yieldSubtreeItemIdsShallowly(childItemId)
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
 * 指定された項目のサブツリーに対応するタブを数える。
 * ページの子孫はサブツリーに含めない（ページそのものはサブツリーに含める）。
 */
export function countTabsInSubtree(state: State, itemId: ItemId): integer {
  return pipe(
    RSet$.from(CurrentState.yieldSubtreeItemIdsShallowly(itemId)),
    RSet$.map((itemId: ItemId) => External.instance.tabItemCorrespondence.getTabIdBy(itemId)),
    RSet$.filterUndefined
  ).size
}

/**
 * 与えられたItemPath群をドキュメント順でソートする。
 * 全てのItemPathのルート項目が同じでなければ正しく計算できない。
 */
export function sortByDocumentOrder(itemPaths: List<ItemPath>): List<ItemPath> {
  const lexicographicalOrder = RArray$.getOrd(NumberOrd).compare
  return itemPaths.sortBy((itemPath) => {
    return toSiblingRankList(itemPath)
  }, lexicographicalOrder)
}

// ItemPathを兄弟順位リストに変換する
function toSiblingRankList(itemPath: ItemPath): RArray<integer> {
  const siblingRankArray = []
  for (let i = 1; i < itemPath.length; i++) {
    const childItemIds = Internal.instance.state.items[itemPath[i - 1]].childItemIds
    siblingRankArray.push(childItemIds.indexOf(itemPath[i]))
  }
  return siblingRankArray
}

/**
 * 項目群をグラフ構造に従って順序ツリー化する。
 * トランスクルードによって同一項目が複数箇所に出現する場合がある。
 */
export function treeify(
  itemIdSet: RSet<ItemId>,
  rootItemId: ItemId,
  passThroughPage: boolean
): MutableOrderedTree<ItemPath> {
  const childrenMap = Set(itemIdSet)
    .flatMap((itemId) => yieldItemPathsFor([itemId], itemIdSet, passThroughPage))
    .groupBy((value) => ItemPath.getRootItemId(value))
    .map((collection) => {
      const sortedItemPaths = CurrentState.sortByDocumentOrder(collection.toList())
      // 同じ兄弟リスト内での重複を排除する
      return sortedItemPaths.filter((itemPath, index) => {
        const appearedItemIds = sortedItemPaths.take(index).map(ItemPath.getItemId)
        return !appearedItemIds.contains(ItemPath.getItemId(itemPath))
      })
    })

  return _treeify(childrenMap, [rootItemId])
}

/**
 * treeify関数用のヘルパー関数。
 * 第1引数を先祖方向に探索し、第2引数に含まれる項目に到達したら、スタート地点からその項目までのItemPathを返す。
 * @param itemIds アキュムレーター引数。長さは必ず1以上。
 * @param itemIdSet 探索の終端となる項目ID群
 * @param passThroughPage ページを貫通して探索するかどうか
 */
function* yieldItemPathsFor(
  itemIds: RArray<ItemId>,
  itemIdSet: RSet<ItemId>,
  passThroughPage: boolean
): Generator<ItemPath> {
  const itemId = itemIds[0]
  assertNonUndefined(itemId)

  if (itemIds.length > 1 && itemIdSet.has(itemId)) {
    yield itemIds
    return
  }

  // ページを貫通しない設定の場合はページの親を探索せず終了する
  if (!passThroughPage && CurrentState.isPage(itemId)) {
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield* yieldItemPathsFor(RArray$.prepend(parentItemId)(itemIds), itemIdSet, passThroughPage)
  }
}

function _treeify(
  childrenMap: Seq.Keyed<ItemId, List<ItemPath>>,
  itemPath: ItemPath
): MutableOrderedTree<ItemPath> {
  const children = childrenMap.get(ItemPath.getItemId(itemPath)) ?? List()
  return new MutableOrderedTree(
    itemPath,
    children.map((child) => _treeify(childrenMap, itemPath.concat(RArray$.shift(child)))).toArray()
  )
}
