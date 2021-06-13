import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/importAndExport'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Readable} from 'svelte/store'

/** 指定されたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId): Readable<boolean> {
  return Internal.d(() => Internal.instance.state.pages[itemId] !== undefined)
}

export function getTargetItemPath(): Readable<ItemPath> {
  return Internal.d(() => CurrentState.getTargetItemPath())
}

export function getAnchorItemPath(): Readable<ItemPath> {
  return Internal.d(() => CurrentState.getAnchorItemPath())
}

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function generateTreeifyWindowTitle(): Readable<string> {
  return Internal.d(() => getContentAsPlainText(CurrentState.getActivePageId()))
}
