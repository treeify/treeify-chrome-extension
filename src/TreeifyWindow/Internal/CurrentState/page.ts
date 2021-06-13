import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Derived} from 'src/TreeifyWindow/Internal/Derived'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {get, writable} from 'svelte/store'

/** アクティブページを切り替える */
export async function switchActivePage(itemId: ItemId) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  unmountPage(itemId)
  Internal.instance.state.mountedPageIds.update((mountedPageIds) => mountedPageIds.push(itemId))
  Internal.instance.markAsMutated(PropertyPath.of('mountedPageIds'))

  Internal.instance.setActivePageId(itemId)

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
  if (get(Derived.isPage(itemId))) return

  const page: State.Page = {
    targetItemPath: writable(List.of(itemId)),
    anchorItemPath: writable(List.of(itemId)),
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
  if (!get(Derived.isPage(itemId))) return

  delete Internal.instance.state.pages[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId))
}

export function setDefaultWindowMode(itemId: ItemId, value: State.DefaultWindowMode) {
  Internal.instance.state.pages[itemId].defaultWindowMode = value
  Internal.instance.markAsMutated(PropertyPath.of('pages', itemId, 'defaultWindowMode'))
}
