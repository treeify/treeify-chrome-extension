import { pipe } from 'fp-ts/function'
import { ItemId } from 'src/TreeifyTab/basicType'
import { assert } from 'src/Utility/Debug/assert'
import { RArray, RArray$ } from 'src/Utility/fp-ts'

export type ItemPath = RArray<ItemId>

export namespace ItemPath {
  export function getRootItemId(itemPath: ItemPath): ItemId {
    assert(itemPath.length > 0)
    return itemPath[0]
  }

  /** パスの終点項目のIDを返す */
  export function getItemId(itemPath: ItemPath): ItemId {
    assert(itemPath.length > 0)
    return RArray$.lastOrThrow(itemPath)
  }

  /** パスの終点より1つ前の項目のIDを返す */
  export function getParentItemId(itemPath: ItemPath): ItemId | undefined {
    return itemPath[itemPath.length - 2]
  }

  export function hasParent(itemPath: ItemPath): boolean {
    return itemPath.length >= 2
  }

  /**
   * 親ItemPathを返す。
   * もし無い場合はundefinedを返す。
   */
  export function getParent(itemPath: ItemPath): ItemPath | undefined {
    if (hasParent(itemPath)) {
      return RArray$.pop(itemPath)
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

    return RArray$.updateAt(itemPath.length - 1, siblingItemId)(itemPath)
  }

  /**
   * 例えば[0, 1, 3, 5]と[0, 1, 2, 4]が与えられたら[0, 1]を返す。
   * 空リストを返す可能性もあるので注意。
   */
  export function getCommonPrefix(lhs: ItemPath, rhs: ItemPath): ItemPath {
    const first1 = lhs[0]
    const first2 = rhs[0]
    if (first1 === undefined || first2 === undefined) return []
    if (first1 !== first2) return []

    return pipe(getCommonPrefix(RArray$.shift(lhs), RArray$.shift(rhs)), RArray$.prepend(first1))
  }
}
