import { is, List } from 'immutable'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

/** ターゲットItemPathを返す */
export function getTargetItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].targetItemPath
}

/** ターゲットItemPathとアンカーItemPathをまとめて上書きする */
export function setTargetItemPath(itemPath: ItemPath) {
  setTargetItemPathOnly(itemPath)
  setAnchorItemPath(itemPath)
}

/** ターゲットItemPathを返す */
export function getAnchorItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].anchorItemPath
}

/** アンカーItemPathを上書きする */
export function setAnchorItemPath(itemPath: ItemPath) {
  const activePageId = CurrentState.getActivePageId()
  Internal.instance.mutate(itemPath, PropertyPath.of('pages', activePageId, 'anchorItemPath'))
}

/** ターゲットItemPathを上書きする（アンカーItemPathは放置） */
export function setTargetItemPathOnly(itemPath: ItemPath) {
  const activePageId = CurrentState.getActivePageId()
  Internal.instance.mutate(itemPath, PropertyPath.of('pages', activePageId, 'targetItemPath'))
}

/**
 * 複数選択されている項目のリストを返す。
 * 複数選択されていなければターゲットItemPathだけの単一要素リストを返す。
 * 並び順は元の兄弟リスト内での並び順と同じ。
 */
export function getSelectedItemPaths(): List<ItemPath> {
  const targetItemPath = CurrentState.getTargetItemPath()
  const anchorItemPath = CurrentState.getAnchorItemPath()
  if (is(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    return List.of(targetItemPath)
  }

  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  assertNonUndefined(parentItemId)
  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const targetItemIndex = childItemIds.indexOf(ItemPath.getItemId(targetItemPath))
  const anchorItemIndex = childItemIds.indexOf(ItemPath.getItemId(anchorItemPath))
  const lowerIndex = Math.min(targetItemIndex, anchorItemIndex)
  const upperIndex = Math.max(targetItemIndex, anchorItemIndex)
  const sliced = childItemIds.slice(lowerIndex, upperIndex + 1)
  return sliced.map((itemId) => ItemPath.createSiblingItemPath(targetItemPath, itemId)!)
}

export function isInSubtreeOfSelectedItemPaths(itemPath: ItemPath): boolean {
  const prefix = itemPath.take(CurrentState.getTargetItemPath().size)
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  return selectedItemPaths.some((selectedItemPath) => is(prefix, selectedItemPath))
}

/**
 * ドキュメント順で1つ上の項目のItemPathを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてDの上の項目はCであり、Cの上の項目はBである。
 *
 * アクティブページには1つ上の項目が存在しないのでundefinedを返す。
 */
export function findAboveItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = ItemPath.getParent(itemPath)
  // 親が居ない場合（アクティブページの場合）は上の項目は存在しない
  if (parentItemPath === undefined) return undefined

  const prevSiblingItemPath = findPrevSiblingItemPath(itemPath)
  if (prevSiblingItemPath !== undefined) {
    // 兄が居る場合、兄かその子孫のうち最も下に表示されるものが該当項目である
    return getLowerEndItemPath(prevSiblingItemPath)
  } else {
    // 兄が居ない場合は親が該当項目である
    return parentItemPath
  }
}

/**
 * ドキュメント順で1つ下の項目のItemPathを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてBの下の項目はCであり、Cの下の項目はDである。
 *
 * 該当項目が存在しない場合はundefinedを返す。
 */
export function findBelowItemPath(itemPath: ItemPath): ItemPath | undefined {
  const firstChildItemId = CurrentState.getDisplayingChildItemIds(itemPath).first(undefined)
  // 表示されている項目が存在するなら
  if (firstChildItemId !== undefined) {
    // 最初の子項目が該当項目である
    return itemPath.push(firstChildItemId)
  }

  // 「弟、または親の弟、または親の親の弟、または…」に該当する項目を返す
  return findFirstFollowingItemPath(itemPath)
}

/**
 * 「弟、または親の弟、または親の親の弟、または…」に該当するItemPathを探索する。
 * 言い換えると、XPathでいうところのfollowingノードのうち、最も上に表示されるItemPathを返す。
 */
export function findFirstFollowingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const nextSiblingItemPath = findNextSiblingItemPath(itemPath)
  // 自身に弟が居る場合は弟を返す
  if (nextSiblingItemPath !== undefined) return nextSiblingItemPath

  const parentItemPath = ItemPath.getParent(itemPath)
  // 親が居ない場合（アクティブページに到達した場合）はfollowing項目なしなのでundefinedを返す
  if (parentItemPath === undefined) return undefined

  // 子孫の弟を再帰的に探索する
  return findFirstFollowingItemPath(parentItemPath)
}

/**
 * 指定されたItemPathの兄のItemPathを返す。
 * もし兄が存在しないときはundefinedを返す。
 */
export function findPrevSiblingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = ItemPath.getParent(itemPath)
  if (parentItemPath === undefined) return undefined

  const parentItemId = ItemPath.getItemId(parentItemPath)
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds

  const index = siblingItemIds.indexOf(ItemPath.getItemId(itemPath))
  // 自身が長男の場合
  if (index === 0) return undefined

  return parentItemPath.push(siblingItemIds.get(index - 1)!)
}

/**
 * 指定されたItemPathの弟のItemPathを返す。
 * もし弟が存在しないときはundefinedを返す。
 */
export function findNextSiblingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = ItemPath.getParent(itemPath)
  if (parentItemPath === undefined) return undefined

  const parentItemId = ItemPath.getItemId(parentItemPath)
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds

  const index = siblingItemIds.indexOf(ItemPath.getItemId(itemPath))
  // 自身が末弟の場合
  if (index === siblingItemIds.size - 1) return undefined

  return parentItemPath.push(siblingItemIds.get(index + 1)!)
}

/**
 * 指定された項目またはその子孫項目のうち、最も下に表示される項目のItemPathを返す。
 * 例えば
 * A
 * | B
 * | C
 * | | D
 * というツリーではDが該当する。
 */
export function getLowerEndItemPath(itemPath: ItemPath): ItemPath {
  if (CurrentState.getDisplayingChildItemIds(itemPath).isEmpty()) {
    // 子を表示していない場合、この項目こそが最も下の項目である
    return itemPath
  }

  const itemId = ItemPath.getItemId(itemPath)
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  // 末尾の子項目に対して再帰呼び出しすることで、最も下に表示される項目を探索する
  return getLowerEndItemPath(itemPath.push(childItemIds.last()))
}

/**
 * 与えられたItemPathの途中経路を全てunfoldする。
 * もし途中経路にページがあったとしても非ページ化までは行わない。
 */
export function moses(itemPath: ItemPath) {
  const parentItemPath = ItemPath.getParent(itemPath)
  if (parentItemPath !== undefined) {
    if (CurrentState.getIsFolded(itemPath)) {
      CurrentState.setIsFolded(itemPath, false)
    }
    moses(parentItemPath)
  }
}

/** 2つのItemPathが兄弟かどうか判定する */
export function isSibling(lhs: ItemPath, rhs: ItemPath): boolean {
  if (lhs.size !== rhs.size || !is(lhs.pop(), rhs.pop())) return false

  const parentItemId = ItemPath.getParentItemId(lhs)
  if (parentItemId === undefined) return false

  return Internal.instance.state.items[parentItemId].childItemIds.contains(ItemPath.getItemId(rhs))
}
