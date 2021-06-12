import {ItemId} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {join} from 'src/TreeifyWindow/svelte'
import {derived, Readable} from 'svelte/store'

/** 指定されたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId): Readable<boolean> {
  return derived(Internal.instance.pageIdsWritable, (pageIds) => {
    return pageIds.has(itemId)
  })
}

export function getTargetItemPath(): Readable<ItemPath> {
  const activePageId = Internal.instance.getActivePageId()
  const nestedStore = derived(activePageId, (activePageId) => {
    return Internal.instance.state.pages[activePageId].targetItemPath
  })
  return join(nestedStore)
}
