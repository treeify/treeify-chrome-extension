import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Derived} from 'src/TreeifyWindow/Internal/Derived/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {get} from 'src/TreeifyWindow/svelte'
import {derived, Readable} from 'svelte/store'

/** 与えられたアイテムがアイテムツリー上で表示する子アイテムのリストを返す */
export function getDisplayingChildItemIds(itemPath: ItemPath): Readable<List<ItemId>> {
  const itemId = ItemPath.getItemId(itemPath)
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  // アクティブページはisCollapsedフラグの状態によらず子を強制的に表示する
  if (itemPath.size === 1) {
    return childItemIds
  }

  const isCollapsed = Derived.getIsCollapsed(itemPath)
  const isPage = Derived.isPage(itemId)
  return derived([childItemIds, isCollapsed, isPage], () => {
    if (get(isCollapsed) || get(isPage)) {
      return List.of<ItemId>()
    } else {
      return get(childItemIds)
    }
  })
}

/**
 * 指定されたアイテムのisCollapsedフラグを返す。
 * 親アイテムに依存するのでItemIdではなくItemPathを取る。
 * TODO: 親のないItemPathを与えられた際の挙動を修正するかコメントに書く
 * @deprecated
 */
export function getIsCollapsed(itemPath: ItemPath): Readable<boolean> {
  return Internal.d(() => CurrentState.getIsCollapsed(itemPath))
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
