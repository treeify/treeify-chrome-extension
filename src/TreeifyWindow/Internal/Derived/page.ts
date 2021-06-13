import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/importAndExport'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {derived, Readable} from 'svelte/store'

/** 指定されたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId): Readable<boolean> {
  return derived(Internal.instance.rerenderingPulse, () => {
    return Internal.instance.state.pages[itemId] !== undefined
  })
}

export function getTargetItemPath(): Readable<ItemPath> {
  return derived(Internal.instance.rerenderingPulse, () => {
    return CurrentState.getTargetItemPath()
  })
}

export function getAnchorItemPath(): Readable<ItemPath> {
  return derived(Internal.instance.rerenderingPulse, () => {
    return CurrentState.getAnchorItemPath()
  })
}

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function generateTreeifyWindowTitle(): Readable<string> {
  return derived(Internal.instance.rerenderingPulse, () => {
    return getContentAsPlainText(CurrentState.getActivePageId())
  })
}
