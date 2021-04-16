import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/importAndExport'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {DefaultWindowMode, Page, State} from 'src/TreeifyWindow/Internal/State'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

/** アクティブページを切り替える */
export async function switchActivePage(itemId: ItemId) {
  CurrentState.setActivePageId(itemId)
  // ページ切り替え後はそのページのターゲットアイテムをフォーカス
  const elementId = ItemTreeContentView.focusableDomElementId(CurrentState.getTargetItemPath())
  External.instance.requestFocusAfterRendering(elementId)

  // ウィンドウモードの自動切り替え機能
  switch (deriveDefaultWindowMode(itemId)) {
    case 'dual':
      await TreeifyWindow.toDualWindowMode()
      break
    case 'full':
      await TreeifyWindow.toFullWindowMode()
      break
    case 'floating':
      // TODO: フローティングウィンドウモードへの変更は未実装
      break
  }
}

function deriveDefaultWindowMode(itemId: ItemId): DefaultWindowMode {
  const page: Page | undefined = Internal.instance.state.pages[itemId]
  if (page !== undefined && page.defaultWindowMode !== 'inherit') {
    return page.defaultWindowMode
  }

  // 設定されていなければ親ページの設定を参照する。
  // 親ページが複数ある場合の選択は未定義でいいと思うので、適当に選ぶ。
  const parentItemId: ItemId | undefined = CurrentState.getParentItemIds(itemId).first()
  if (parentItemId !== undefined) return deriveDefaultWindowMode(parentItemId)

  return 'keep'
}

/** state.activePageIdを設定する */
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
    defaultWindowMode: 'inherit',
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

export function setDefaultWindowMode(itemId: ItemId, value: DefaultWindowMode) {
  Internal.instance.state.pages[itemId].defaultWindowMode = value
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId, 'defaultWindowMode'))
}

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function deriveTreeifyWindowTitle(state: State): string {
  return getContentAsPlainText(state.activePageId)
}
