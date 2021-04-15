import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/importAndExport'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Page, State} from 'src/TreeifyWindow/Internal/State'

/** アクティブページを設定する */
export function setActivePageId(itemId: ItemId) {
  Internal.instance.state.activePageId = itemId
  Internal.instance.markAsMutated(PropertyPath.of('activePageId'))
}

/**
 * ページをマウントする。
 * マウント済みの場合は何もしない
 */
export function mountPage(itemId: ItemId) {
  if (Internal.instance.state.mountedPageIds.contains(itemId)) return

  Internal.instance.state.mountedPageIds = Internal.instance.state.mountedPageIds.push(itemId)
  Internal.instance.markAsMutated(PropertyPath.of('mountedPageIds'))
}

/**
 * ページをアンマウントする。
 * マウントされていない場合は何もしない。
 */
export function unmountPage(itemId: ItemId) {
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.state.mountedPageIds = mountedPageIds.remove(index)
    Internal.instance.markAsMutated(PropertyPath.of('mountedPageIds'))
  }
}

/** 与えられたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId) {
  return Internal.instance.state.pages[itemId] !== undefined
}

/** 与えられたアイテムをページ化する */
export function turnIntoPage(itemId: ItemId) {
  // 既にページだった場合は何もしない
  if (isPage(itemId)) return

  const page: Page = {
    targetItemPath: List.of(itemId),
    anchorItemPath: List.of(itemId),
    defaultWindowMode: null,
  }
  Internal.instance.state.pages[itemId] = page
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId))
}

/**
 * 与えられたアイテムを非ページ化する。
 * 既に非ページだった場合は何もしない。
 */
export function turnIntoNonPage(itemId: ItemId) {
  if (!isPage(itemId)) return

  delete Internal.instance.state.pages[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId))
}

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function deriveTreeifyWindowTitle(state: State): string {
  return getContentAsPlainText(state.activePageId)
}
