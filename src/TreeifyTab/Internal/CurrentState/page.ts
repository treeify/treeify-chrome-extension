import {List} from 'immutable'
import {assertNonNull} from 'src/Common/Debug/assert'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {extractPlainText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Page} from 'src/TreeifyTab/Internal/State'
import {MainAreaContentView} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import {tick} from 'svelte'

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

/** 与えられた項目がページかどうかを返す */
export function isPage(itemId: ItemId) {
  return Internal.instance.state.pages[itemId] !== undefined
}

/** 与えられた項目をページ化する */
export function turnIntoPage(itemId: ItemId) {
  // 既にページだった場合は何もしない
  if (isPage(itemId)) return

  const page: Page = {
    targetItemPath: List.of(itemId),
    anchorItemPath: List.of(itemId),
  }
  Internal.instance.mutate(page, PropertyPath.of('pages', itemId))
}

/**
 * 与えられた項目を非ページ化する。
 * 既に非ページだった場合は何もしない。
 */
export function turnIntoNonPage(itemId: ItemId) {
  if (!isPage(itemId)) return

  Internal.instance.delete(PropertyPath.of('pages', itemId))

  // 他のワークスペースのアクティブページが不正にならないよう退避する
  for (const workspacesKey in Internal.instance.state.workspaces) {
    if (Internal.instance.state.workspaces[workspacesKey].activePageId === itemId) {
      Internal.instance.mutate(
        TOP_ITEM_ID,
        PropertyPath.of('workspaces', workspacesKey, 'activePageId')
      )
    }
  }
}

/** Treeifyタブのタイトルとして表示する文字列を返す */
export function deriveTreeifyTabTitle(): string {
  const activePageId = CurrentState.getActivePageId()
  const parentPageIds = CurrentState.getParentPageIds(activePageId)
  const parentPageId = parentPageIds.first(undefined)
  if (parentPageId !== undefined) {
    return `${extractPlainText(List.of(activePageId))} - ${extractPlainText(List.of(parentPageId))}`
  } else {
    return extractPlainText(List.of(activePageId))
  }
}

export function jumpTo(itemPath: ItemPath) {
  const containerPageId = ItemPath.getRootItemId(itemPath)

  // ジャンプ先のページのtargetItemPathを更新する
  Internal.instance.mutate(itemPath, PropertyPath.of('pages', containerPageId, 'targetItemPath'))
  Internal.instance.mutate(itemPath, PropertyPath.of('pages', containerPageId, 'anchorItemPath'))

  CurrentState.moses(itemPath)

  // ページを切り替える
  CurrentState.switchActivePage(containerPageId)

  // 再描画完了後に対象項目に自動スクロールする
  tick().then(() => {
    const targetElementId = MainAreaContentView.focusableDomElementId(itemPath)
    const focusableElement = document.getElementById(targetElementId)
    assertNonNull(focusableElement)
    focusableElement.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    })
  })
}
