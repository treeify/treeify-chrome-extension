import {is, List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {get} from 'svelte/store'

const ACTIVE_PAGE_ID_KEY = 'ACTIVE_PAGE_ID_KEY'

export function getTargetItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].targetItemPath
}

export function getAnchorItemPath(): ItemPath {
  return Internal.instance.state.pages[CurrentState.getActivePageId()].anchorItemPath
}

/**
 * 複数選択されているアイテムのリストを返す。
 * 複数選択されていなければ単一要素のリストを返す。
 * リストの並び順は兄弟リスト内での並び順と同じ。つまり上から下の順（targetとanchorの位置関係に依存しない）。
 */
export function getSelectedItemPaths(): List<ItemPath> {
  const targetItemPath = CurrentState.getTargetItemPath()
  const anchorItemPath = CurrentState.getAnchorItemPath()

  if (is(targetItemPath, anchorItemPath)) {
    // そもそも複数範囲されていない場合
    return List.of(targetItemPath)
  }

  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  assertNonUndefined(parentItemId)
  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const targetItemIndex = childItemIds.indexOf(ItemPath.getItemId(targetItemPath))
  const anchorItemIndex = childItemIds.indexOf(ItemPath.getItemId(anchorItemPath))
  const lowerIndex = Math.min(targetItemIndex, anchorItemIndex)
  const upperIndex = Math.max(targetItemIndex, anchorItemIndex)
  const sliced = childItemIds.slice(lowerIndex, upperIndex + 1)
  return sliced.map((itemId) => ItemPath.createSiblingItemPath(targetItemPath, itemId)!)
}

export function getActivePageId(): ItemId {
  // TODO: 最適化の余地あり（キャッシュ導入）
  const savedActivePageId = localStorage.getItem(ACTIVE_PAGE_ID_KEY)
  if (savedActivePageId === null) {
    return CurrentState.getFilteredMountedPageIds().last() as number
  } else {
    const activePageId = parseInt(savedActivePageId)
    if (CurrentState.isPage(activePageId)) {
      return activePageId
    } else {
      return CurrentState.getFilteredMountedPageIds().last() as number
    }
  }
}

export function setActivePageId(activePageId: ItemId) {
  localStorage.setItem(ACTIVE_PAGE_ID_KEY, activePageId.toString())
}

/** アクティブページを切り替える */
export async function switchActivePage(itemId: ItemId) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  unmountPage(itemId)
  Internal.instance.state.mountedPageIds.update((mountedPageIds) => mountedPageIds.push(itemId))
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

function deriveDefaultWindowMode(itemId: ItemId): State.DefaultWindowMode {
  const page: State.Page | undefined = Internal.instance.state.pages[itemId]
  if (page !== undefined && page.defaultWindowMode !== 'inherit') {
    return page.defaultWindowMode
  }

  // 設定されていなければ親ページの設定を参照する。
  // 親ページが複数ある場合の選択は未定義でいいと思うので、適当に選ぶ。
  const parentItemId: ItemId | undefined = CurrentState.getParentItemIds(itemId).first()
  if (parentItemId !== undefined) return deriveDefaultWindowMode(parentItemId)

  return 'keep'
}

/**
 * ページをアンマウントする。
 * マウントされていない場合は何もしない。
 */
export function unmountPage(itemId: ItemId) {
  const mountedPageIds = get(Internal.instance.state.mountedPageIds)
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.state.mountedPageIds.set(mountedPageIds.remove(index))
    Internal.instance.markAsMutated(PropertyPath.of('mountedPageIds'))
  }
}

/** 与えられたアイテムをページ化する */
export function turnIntoPage(itemId: ItemId) {
  // 既にページだった場合は何もしない
  if (CurrentState.isPage(itemId)) return

  const page: State.Page = {
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
  if (!CurrentState.isPage(itemId)) return

  delete Internal.instance.state.pages[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId))
}

/** 指定されたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId): boolean {
  return Internal.instance.state.pages[itemId] !== undefined
}

export function setDefaultWindowMode(itemId: ItemId, value: State.DefaultWindowMode) {
  Internal.instance.state.pages[itemId].defaultWindowMode = value
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId, 'defaultWindowMode'))
}
