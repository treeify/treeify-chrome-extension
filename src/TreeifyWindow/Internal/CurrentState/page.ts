import {List} from 'immutable'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {extractPlainText} from 'src/TreeifyWindow/Internal/ImportExport/indentedText'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {DefaultWindowMode, Page} from 'src/TreeifyWindow/Internal/State'

/** アクティブページを切り替える */
export async function switchActivePage(itemId: ItemId) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.mutate(
      mountedPageIds.remove(index).push(itemId),
      PropertyPath.of('mountedPageIds')
    )
  } else {
    Internal.instance.mutate(mountedPageIds.push(itemId), PropertyPath.of('mountedPageIds'))
  }

  CurrentState.setActivePageId(itemId)
}

/** 現在のワークスペースのactiveItemIdを返す */
export function getActivePageId(): ItemId {
  return Internal.instance.state.workspaces[CurrentState.getCurrentWorkspaceId()].activePageId
}

/** 現在のワークスペースのactiveItemIdを設定する */
export function setActivePageId(itemId: ItemId) {
  const currentWorkspaceId = CurrentState.getCurrentWorkspaceId()
  Internal.instance.mutate(
    itemId,
    PropertyPath.of('workspaces', currentWorkspaceId, 'activePageId')
  )
}

/**
 * ページをアンマウントする。
 * マウントされていない場合は何もしない。
 */
export function unmountPage(itemId: ItemId) {
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.mutate(mountedPageIds.remove(index), PropertyPath.of('mountedPageIds'))
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
  Internal.instance.mutate(page, PropertyPath.of('pages', itemId))
}

/**
 * 与えられたアイテムを非ページ化する。
 * 既に非ページだった場合は何もしない。
 */
export function turnIntoNonPage(itemId: ItemId) {
  if (!isPage(itemId)) return

  Internal.instance.delete(PropertyPath.of('pages', itemId))
}

export function setDefaultWindowMode(itemId: ItemId, value: DefaultWindowMode) {
  Internal.instance.mutate(value, PropertyPath.of('pages', itemId, 'defaultWindowMode'))
}

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function deriveTreeifyWindowTitle(): string {
  const activePageId = CurrentState.getActivePageId()
  const parentPageIds = CurrentState.getParentPageIds(activePageId)
  const parentPageId = parentPageIds.first(undefined)
  if (parentPageId !== undefined) {
    return `${extractPlainText(List.of(activePageId))} - ${extractPlainText(List.of(parentPageId))}`
  } else {
    return extractPlainText(List.of(activePageId))
  }
}
