import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {get as svelteGet, Readable} from 'svelte/store'

/**
 * 指定されたアイテムのisCollapsedフラグを返す。
 * 親アイテムに依存するのでItemIdではなくItemPathを取る。
 * TODO: 親のないItemPathを与えられた際の挙動をコメントに書く
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

/**
 * Svelte標準のget関数をちょっと柔軟にしたユーティリティ関数。
 * nullやundefinedをいい感じにスルーしてくれる。
 */
export function get<T>(readable: Readable<T>): T
export function get<T>(readable: Readable<T> | undefined | null): T | undefined
export function get<T>(readable: Readable<T> | undefined | null) {
  if (readable === undefined || readable === null) return undefined

  return svelteGet(readable)
}
