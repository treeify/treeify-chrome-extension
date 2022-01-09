import { pipe } from 'fp-ts/function'
import { ItemId, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { extractPlainText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Page } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { assertNonNull } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { tick } from 'svelte'

/** アクティブページを切り替える */
export function switchActivePage(itemId: ItemId) {
  // マウントされたページがmountedPageIdsの末尾に来るようにする。
  // （ページツリーの足跡表示を実現するための処理）
  const mountedPageIds = Internal.instance.state.mountedPageIds
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    Internal.instance.mutate(
      pipe(mountedPageIds, RArray$.removeAt(index), RArray$.append(itemId)),
      PropertyPath.of('mountedPageIds')
    )
  } else {
    Internal.instance.mutate(
      RArray$.append(itemId)(mountedPageIds),
      PropertyPath.of('mountedPageIds')
    )
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
    Internal.instance.mutate(
      RArray$.removeAt(index)(mountedPageIds),
      PropertyPath.of('mountedPageIds')
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

  CurrentState.moses(itemPath)

  // ジャンプ先のページのtargetItemPathを更新する
  CurrentState.setTargetItemPath(itemPath)
  Rerenderer.instance.requestToFocusTargetItem()

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
