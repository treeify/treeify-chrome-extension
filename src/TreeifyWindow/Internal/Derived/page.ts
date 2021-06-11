import {ItemId} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {derived, Readable} from 'svelte/store'

/** 指定されたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId): Readable<boolean> {
  return derived(Internal.instance.pageIdsWritable, (pageIds) => {
    return pageIds.has(itemId)
  })
}
