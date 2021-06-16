import {is, List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'

/** ターゲットアイテムパスを返す */
export function getTargetItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].targetItemPath
}

/** ターゲットアイテムパスとアンカーアイテムパスをまとめて上書きする */
export function setTargetItemPath(itemPath: ItemPath) {
  setTargetItemPathOnly(itemPath)
  setAnchorItemPath(itemPath)
}

/** ターゲットアイテムパスを返す */
export function getAnchorItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].anchorItemPath
}

/** アンカーアイテムパスを上書きする */
export function setAnchorItemPath(itemPath: ItemPath) {
  const activePageId = CurrentState.getActivePageId()
  Internal.instance.state.pages[activePageId].anchorItemPath = itemPath
  Internal.instance.markAsMutated(PropertyPath.of('pages', activePageId, 'anchorItemPath'))
}

/** ターゲットアイテムパスを上書きする（アンカーアイテムパスは放置） */
export function setTargetItemPathOnly(itemPath: ItemPath) {
  const activePageId = CurrentState.getActivePageId()
  Internal.instance.state.pages[activePageId].targetItemPath = itemPath
  Internal.instance.markAsMutated(PropertyPath.of('pages', activePageId, 'targetItemPath'))
}

/**
 * 複数選択されているアイテムのリストを返す。
 * 複数選択されていなければターゲットアイテムパスだけの単一要素リストを返す。
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

/**
 * ドキュメント順で1つ上のアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてDの上のアイテムはCであり、Cの上のアイテムはBである。
 *
 * アクティブページには1つ上のアイテムが存在しないのでundefinedを返す。
 */
export function findAboveItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = ItemPath.getParent(itemPath)
  // 親が居ない場合（アクティブページの場合）は上のアイテムは存在しない
  if (parentItemPath === undefined) return undefined

  const prevSiblingItemPath = findPrevSiblingItemPath(itemPath)
  if (prevSiblingItemPath !== undefined) {
    // 兄が居る場合、兄かその子孫のうち最も下に表示されるものが該当アイテムである
    return getLowerEndItemPath(prevSiblingItemPath)
  } else {
    // 兄が居ない場合は親が該当アイテムである
    return parentItemPath
  }
}

/**
 * ドキュメント順で1つ下のアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてBの下のアイテムはCであり、Cの下のアイテムはDである。
 *
 * 該当アイテムが存在しない場合はundefinedを返す。
 */
export function findBelowItemPath(itemPath: ItemPath): ItemPath | undefined {
  const firstChildItemId = CurrentState.getDisplayingChildItemIds(itemPath).first(undefined)
  // 表示されているアイテムが存在するなら
  if (firstChildItemId !== undefined) {
    // 最初の子アイテムが該当アイテムである
    return itemPath.push(firstChildItemId)
  }

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを返す
  return findFirstFollowingItemPath(itemPath)
}

/**
 * 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムパスを探索する。
 * 言い換えると、XPathでいうところのfollowingノードのうち、最も上に表示されるアイテムパスを返す。
 */
export function findFirstFollowingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const nextSiblingItemPath = findNextSiblingItemPath(itemPath)
  // 自身に弟が居る場合は弟を返す
  if (nextSiblingItemPath !== undefined) return nextSiblingItemPath

  const parentItemPath = ItemPath.getParent(itemPath)
  // 親が居ない場合（アクティブページに到達した場合）はfollowingアイテムなしなのでundefinedを返す
  if (parentItemPath === undefined) return undefined

  // 子孫の弟を再帰的に探索する
  return findFirstFollowingItemPath(parentItemPath)
}

/**
 * 指定されたアイテムパスの兄のアイテムパスを返す。
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
 * 指定されたアイテムパスの弟のアイテムパスを返す。
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
 * 指定されたアイテムまたはその子孫アイテムのうち、最も下に表示されるアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | C
 * | | D
 * というツリーではDが該当する。
 */
export function getLowerEndItemPath(itemPath: ItemPath): ItemPath {
  if (CurrentState.getDisplayingChildItemIds(itemPath).isEmpty()) {
    // 子を表示していない場合、このアイテムこそが最も下のアイテムである
    return itemPath
  }

  const itemId = ItemPath.getItemId(itemPath)
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  // 末尾の子アイテムに対して再帰呼び出しすることで、最も下に表示されるアイテムを探索する
  return getLowerEndItemPath(itemPath.push(childItemIds.last()))
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
