import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

/**
 * ターゲット項目がページなら非ページ化する。
 * ターゲット項目が非ページならページ化する。
 */
export function togglePaged() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // アクティブページに対しては何もしない
  if (selectedItemPaths[0].length === 1) return

  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    if (CurrentState.isPage(selectedItemId)) {
      CurrentState.unmountPage(selectedItemId)
      CurrentState.turnIntoNonPage(selectedItemId)
    } else {
      CurrentState.turnIntoPage(selectedItemId)
    }
  }
}

/** 対象項目がページなら、そのページに切り替える */
export function switchPage() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  if (CurrentState.isPage(targetItemId)) {
    CurrentState.switchActivePage(targetItemId, true)
    Rerenderer.instance.requestToFocusTargetItem()
  }
}

/** 対象項目をページ化する */
export function turnIntoPage() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    CurrentState.turnIntoPage(ItemPath.getItemId(selectedItemPath))
  }
}

/** 対象を非ページ化する */
export function turnIntoNonPage() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // アクティブページに対しては何もしない
  if (selectedItemPaths[0].length === 1) return

  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.unmountPage(selectedItemId)
    CurrentState.turnIntoNonPage(selectedItemId)
  }
}

export function addToPageTree() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    if (CurrentState.isPage(selectedItemId)) {
      CurrentState.mountPage(selectedItemId)
    }
  }
}

export function removeFromPageTree() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  if (ItemPath.getItemId(selectedItemPaths[0]) === TOP_ITEM_ID) {
    // トップページはページツリーから削除できない
    return
  }

  for (const selectedItemPath of selectedItemPaths) {
    CurrentState.unmountPage(ItemPath.getItemId(selectedItemPath))
  }
}
