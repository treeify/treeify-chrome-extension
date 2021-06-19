import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/ImportExport/indentedText'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {DefaultWindowMode, Page} from 'src/TreeifyWindow/Internal/State'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'

/** アクティブページを切り替える */
export async function switchActivePage(itemId: ItemId) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  unmountPage(itemId)
  Internal.instance.state.mountedPageIds = Internal.instance.state.mountedPageIds.push(itemId)
  Internal.instance.markAsMutated(PropertyPath.of('mountedPageIds'))

  CurrentState.setActivePageId(itemId)

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

const ACTIVE_PAGE_ID_KEY = 'ACTIVE_PAGE_ID_KEY'

/**
 * localStorageのアクティブページIDを返す。
 * 保存されていない場合や値が不正な場合は適当なページIDを返す。
 */
export function getActivePageId(): ItemId {
  const savedActivePageId = localStorage.getItem(ACTIVE_PAGE_ID_KEY)
  if (savedActivePageId === null) {
    return CurrentState.getFilteredMountedPageIds().last()
  } else {
    const activePageId = parseInt(savedActivePageId)
    if (CurrentState.isPage(activePageId)) {
      return activePageId
    } else {
      return CurrentState.getFilteredMountedPageIds().last()
    }
  }
}

/** localStorageにアクティブページIDを保存する */
export function setActivePageId(itemId: ItemId) {
  localStorage.setItem(ACTIVE_PAGE_ID_KEY, itemId.toString())
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
export function deriveTreeifyWindowTitle(): string {
  return getContentAsPlainText(CurrentState.getActivePageId())
}

/**
 * 指定されたアイテムが所属する全てのページのアイテムIDを返す。
 * 自身がページの場合は自身のアイテムIDを返す。
 * グラフ構造次第では同じアイテムIDを複数回返すこともあるので注意。
 */
export function yieldItemPaths(itemId: ItemId): Generator<ItemPath> {
  return _yieldItemPaths(List.of(itemId))
}

function* _yieldItemPaths(itemPath: ItemPath): Generator<ItemPath> {
  const rootItemId = ItemPath.getRootItemId(itemPath)
  if (CurrentState.isPage(rootItemId)) {
    yield itemPath
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(rootItemId)) {
    yield* _yieldItemPaths(itemPath.unshift(parentItemId))
  }
}
