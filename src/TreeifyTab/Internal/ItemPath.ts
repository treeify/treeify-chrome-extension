import {List} from 'immutable'
import {assert} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyTab/basicType'

export type ItemPath = List<ItemId>

export namespace ItemPath {
  export function getRootItemId(itemPath: ItemPath): ItemId {
    assert(!itemPath.isEmpty())
    return itemPath.first()
  }

  /** パスの終点項目のIDを返す */
  export function getItemId(itemPath: ItemPath): ItemId {
    assert(!itemPath.isEmpty())
    return itemPath.last()
  }

  /** パスの終点より1つ前の項目のIDを返す */
  export function getParentItemId(itemPath: ItemPath): ItemId | undefined {
    return itemPath.get(-2)
  }

  export function hasParent(itemPath: ItemPath): boolean {
    return itemPath.size >= 2
  }

  /**
   * 親ItemPathを返す。
   * もし無い場合はundefinedを返す。
   */
  export function getParent(itemPath: ItemPath): ItemPath | undefined {
    if (hasParent(itemPath)) {
      return itemPath.pop()
    } else {
      return undefined
    }
  }

  /** このItemPathの末尾のItemIdを置き換えることで新しいItemPathを作成する */
  export function createSiblingItemPath(
    itemPath: ItemPath,
    siblingItemId: ItemId
  ): ItemPath | undefined {
    if (!hasParent(itemPath)) return undefined

    return itemPath.set(-1, siblingItemId)
  }

  /**
   * 例えば[0, 1, 3, 5]と[0, 1, 2, 4]が与えられたら[0, 1]を返す。
   * 空リストを返す可能性もあるので注意。
   */
  export function getCommonPrefix(lhs: ItemPath, rhs: ItemPath): ItemPath {
    const first1 = lhs.first(undefined)
    const first2 = rhs.first(undefined)
    if (first1 === undefined || first2 === undefined) return List.of()
    if (first1 !== first2) return List.of()

    return getCommonPrefix(lhs.shift(), rhs.shift()).unshift(first1)
  }
}
