import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { NERArray, Option$, RArray$ } from 'src/Utility/fp-ts'

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
  Internal.instance.mutate(itemPath, StatePath.of('pages', activePageId, 'anchorItemPath'))
}

/** ターゲットItemPathを上書きする（アンカーItemPathは放置） */
export function setTargetItemPathOnly(itemPath: ItemPath) {
  const activePageId = CurrentState.getActivePageId()
  Internal.instance.mutate(itemPath, StatePath.of('pages', activePageId, 'targetItemPath'))

  // ダイアログを開いた状態でターゲットが変更されると、想定していない項目に対する処理が走って危険なので自動的にダイアログを閉じる
  External.instance.dialogState = undefined
}

/**
 * 複数選択されている項目のリストを返す。
 * 複数選択されていなければターゲットItemPathだけの単一要素リストを返す。
 * 並び順は元の兄弟リスト内での並び順と同じ。
 */
export function getSelectedItemPaths(): NERArray<ItemPath> {
  const targetItemPath = CurrentState.getTargetItemPath()
  const anchorItemPath = CurrentState.getAnchorItemPath()
  if (RArray$.shallowEqual(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    return [targetItemPath]
  }

  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  assertNonUndefined(parentItemId)
  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const targetItemIndex = childItemIds.indexOf(ItemPath.getItemId(targetItemPath))
  const anchorItemIndex = childItemIds.indexOf(ItemPath.getItemId(anchorItemPath))
  const lowerIndex = Math.min(targetItemIndex, anchorItemIndex)
  const upperIndex = Math.max(targetItemIndex, anchorItemIndex)
  const sliced = childItemIds.slice(lowerIndex, upperIndex + 1)
  return sliced.map(
    (itemId) => ItemPath.createSiblingItemPath(targetItemPath, itemId)!
  ) as unknown as NERArray<ItemPath>
}

export function isInSubtreeOfSelectedItemPaths(itemPath: ItemPath): boolean {
  const prefix = RArray$.takeLeft(CurrentState.getTargetItemPath().length)(itemPath)
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  return selectedItemPaths.some((selectedItemPath) =>
    RArray$.shallowEqual(prefix, selectedItemPath)
  )
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
  const firstChildItemId = CurrentState.getDisplayingChildItemIds(itemPath)[0]
  // 表示されている項目が存在するなら
  if (firstChildItemId !== undefined) {
    // 最初の子項目が該当項目である
    return RArray$.append(firstChildItemId)(itemPath)
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

  return RArray$.append(siblingItemIds[index - 1])(parentItemPath)
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
  if (index === siblingItemIds.length - 1) return undefined

  return RArray$.append(siblingItemIds[index + 1])(parentItemPath)
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
  if (CurrentState.getDisplayingChildItemIds(itemPath).length === 0) {
    // 子を表示していない場合、この項目こそが最も下の項目である
    return itemPath
  }

  const itemId = ItemPath.getItemId(itemPath)
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  // 末尾の子項目に対して再帰呼び出しすることで、最も下に表示される項目を探索する
  const last = Option$.getOrThrow(RArray$.last(childItemIds))
  return getLowerEndItemPath(RArray$.append(last)(itemPath))
}

/**
 * 与えられたItemPathの途中経路を全てunfoldする。
 * もし途中経路にページがあったとしても非ページ化は行わない。
 */
export function revealItemPath(itemPath: ItemPath) {
  const parentItemPath = ItemPath.getParent(itemPath)
  if (parentItemPath !== undefined) {
    if (CurrentState.getIsFolded(itemPath)) {
      CurrentState.setIsFolded(itemPath, false)
    }
    revealItemPath(parentItemPath)
  }
}

/**
 * 与えられたItemPathが不正でないかどうか判定する。
 * 具体的には次の全てを満たすかどうかを判定する。
 * - 長さが1以上であること
 * - 各項目が実在すること
 * - ItemPath内で隣り合う項目間が親子であること（ただしparentsプロパティまでは調べない）
 */
export function isValidItemPath(itemPath: ItemPath): boolean {
  if (itemPath.length === 0) return false

  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  const parentItemId = ItemPath.getParentItemId(itemPath)
  if (parentItemId === undefined) {
    return item !== undefined
  }

  if (item === undefined) return false
  if (item.parents[parentItemId] === undefined) return false

  return isValidItemPath(RArray$.pop(itemPath))
}

/** 2つのItemPathが兄弟かどうか判定する */
export function isSibling(lhs: ItemPath, rhs: ItemPath): boolean {
  if (lhs.length !== rhs.length || !RArray$.shallowEqual(RArray$.pop(lhs), RArray$.pop(rhs)))
    return false

  const parentItemId = ItemPath.getParentItemId(lhs)
  if (parentItemId === undefined) return false

  return Internal.instance.state.items[parentItemId].childItemIds.includes(ItemPath.getItemId(rhs))
}
