import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Readable} from 'svelte/store'

/**
 * 与えられたアイテムがアイテムツリー上で表示する子アイテムのリストを返す
 * @deprecated
 */
export function getDisplayingChildItemIds(itemPath: ItemPath): Readable<List<ItemId>> {
  return Internal.d(() => CurrentState.getDisplayingChildItemIds(itemPath))
}

/**
 * 指定されたアイテムパスの最後のエッジのラベルを返す。
 * 親を持たないアイテムパスの場合、undefinedを返す。
 */
export function getLabels(itemPath: ItemPath): Readable<List<string>> | undefined {
  if (!ItemPath.hasParent(itemPath)) return undefined

  return Internal.d(() => CurrentState.getLabels(itemPath)!)
}
