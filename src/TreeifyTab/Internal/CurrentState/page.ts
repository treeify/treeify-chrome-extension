import { pipe } from 'fp-ts/function'
import { ItemId, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { extractPlainText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Page } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assert } from 'src/Utility/Debug/assert'
import { NERArray, RArray$ } from 'src/Utility/fp-ts'

/** アクティブページを切り替える */
export function switchActivePage(itemId: ItemId, withoutMount: boolean = false) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.mutate(
      pipe(mountedPageIds, RArray$.removeAt(index), RArray$.append(itemId)),
      StatePath.of('mountedPageIds')
    )
  } else if (!withoutMount) {
    CurrentState.mountPage(itemId)
  }

  CurrentState.setActivePageId(itemId)

  Rerenderer.instance.requestToScrollCenter()
}

/** 現在のワークスペースのactiveItemIdを返す */
export function getActivePageId(): ItemId {
  return Internal.instance.state.workspaces[External.instance.getCurrentWorkspaceId()].activePageId
}

/** 現在のワークスペースのactiveItemIdを設定する */
export function setActivePageId(itemId: ItemId) {
  const currentWorkspaceId = External.instance.getCurrentWorkspaceId()
  Internal.instance.mutate(itemId, StatePath.of('workspaces', currentWorkspaceId, 'activePageId'))
}

export function mountPage(itemId: ItemId) {
  const mountedPageIds = Internal.instance.state.mountedPageIds
  if (mountedPageIds.includes(itemId)) return

  Internal.instance.mutate(RArray$.append(itemId)(mountedPageIds), StatePath.of('mountedPageIds'))
}

/**
 * ページをアンマウントする。
 * マウントされていない場合は何もしない。
 */
export function unmountPage(itemId: ItemId) {
  assert(itemId !== TOP_ITEM_ID)
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.mutate(
      RArray$.removeAt(index)(mountedPageIds) as NERArray<ItemId>,
      StatePath.of('mountedPageIds')
    )
  }
}

/** 与えられた項目がページかどうかを返す */
export function isPage(itemId: ItemId) {
  return Internal.instance.state.pages[itemId] !== undefined
}

/** 与えられた項目をページ化する */
export function turnIntoPage(itemId: ItemId) {
  // 既にページだった場合は何もしない
  if (isPage(itemId)) return

  const page: Page = {
    targetItemPath: [itemId],
    anchorItemPath: [itemId],
  }
  Internal.instance.mutate(page, StatePath.of('pages', itemId))
}

/**
 * 与えられた項目を非ページ化する。
 * 既に非ページだった場合は何もしない。
 */
export function turnIntoNonPage(itemId: ItemId) {
  if (!isPage(itemId)) return

  Internal.instance.delete(StatePath.of('pages', itemId))

  // 他のワークスペースのアクティブページが不正にならないよう退避する
  for (const workspaceId of CurrentState.getWorkspaceIds()) {
    if (Internal.instance.state.workspaces[workspaceId].activePageId === itemId) {
      Internal.instance.mutate(TOP_ITEM_ID, StatePath.of('workspaces', workspaceId, 'activePageId'))
    }
  }
}

/** Treeifyタブのタイトルとして表示する文字列を返す */
export function deriveTreeifyTabTitle(): string {
  const activePageId = CurrentState.getActivePageId()
  const parentPageIds = CurrentState.getParentPageIds(activePageId)
  const parentPageId = parentPageIds[0]
  if (parentPageId !== undefined) {
    return `${extractPlainText(activePageId)} - ${extractPlainText(parentPageId)}`
  } else {
    return extractPlainText(activePageId)
  }
}

export function jumpTo(itemPath: ItemPath) {
  const containerPageId = ItemPath.getRootItemId(itemPath)

  // ページを切り替える
  CurrentState.switchActivePage(containerPageId)

  CurrentState.revealItemPath(itemPath)
  if (!CurrentState.isPage(ItemPath.getItemId(itemPath))) {
    CurrentState.setIsFolded(itemPath, false)
  }

  // ジャンプ先のページのtargetItemPathを更新する
  CurrentState.setTargetItemPath(itemPath)
  Rerenderer.instance.requestToScrollCenter()
  Rerenderer.instance.requestToFocusTargetItem()
}
