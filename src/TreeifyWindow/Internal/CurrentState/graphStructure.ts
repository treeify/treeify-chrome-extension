import {assertNonUndefined} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

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
