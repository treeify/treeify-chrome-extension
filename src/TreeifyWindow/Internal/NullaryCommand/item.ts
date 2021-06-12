import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Derived} from 'src/TreeifyWindow/Internal/Derived'
import {InnerHtml} from 'src/TreeifyWindow/Internal/InnerHtml'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {get} from 'svelte/store'

/** ターゲットアイテムのisCollapsedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleCollapsed() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  CurrentState.setIsCollapsed(targetItemPath, !get(Derived.getIsCollapsed(targetItemPath)))
  CurrentState.updateItemTimestamp(targetItemId)
}

/** アウトライナーのいわゆるインデント操作を実行するコマンド。 */
export function indentItem() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(selectedItemPaths.first())
  // 兄が居ない場合、何もしない
  if (prevSiblingItemPath === undefined) return

  const prevSiblingItemId = ItemPath.getItemId(prevSiblingItemPath)

  // 兄がページの場合は展開できないので何もしない
  if (get(Derived.isPage(prevSiblingItemId))) return

  // 兄を展開する
  CurrentState.setIsCollapsed(prevSiblingItemPath, false)

  const parentItemId = ItemPath.getParentItemId(prevSiblingItemPath)
  assertNonUndefined(parentItemId)
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(parentItemId, selectedItemId)
    // 兄の最後の子になるようターゲットアイテムを配置
    CurrentState.insertLastChildItem(prevSiblingItemId, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  if (selectedItemPaths.size === 1) {
    // ターゲットアイテムを移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPath(prevSiblingItemPath.push(targetItemId))

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    // 移動先を引き続き選択中にする
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPathOnly(prevSiblingItemPath.push(targetItemId))
    const anchorItemId = ItemPath.getItemId(CurrentState.getAnchorItemPath())
    CurrentState.setAnchorItemPath(prevSiblingItemPath.push(anchorItemId))
  }
}

/** アウトライナーのいわゆるアンインデント操作を実行するコマンド。 */
export function unindentItem() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const parentItemPath = ItemPath.getParent(selectedItemPaths.first())

  // 親または親の親が居ない場合は何もしない
  if (parentItemPath === undefined) return
  if (!ItemPath.hasParent(parentItemPath)) return

  for (const selectedItemPath of selectedItemPaths.reverse()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(
      ItemPath.getItemId(parentItemPath),
      selectedItemId
    )
    // 親の弟として配置する
    CurrentState.insertNextSiblingItem(parentItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  if (selectedItemPaths.size === 1) {
    // ターゲットアイテムを移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    const siblingItemPath = ItemPath.createSiblingItemPath(parentItemPath, targetItemId)!
    CurrentState.setTargetItemPath(siblingItemPath)

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    // 移動先を引き続き選択中にする
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPathOnly(
      ItemPath.createSiblingItemPath(parentItemPath, targetItemId)!
    )
    const anchorItemId = ItemPath.getItemId(CurrentState.getAnchorItemPath())
    CurrentState.setAnchorItemPath(ItemPath.createSiblingItemPath(parentItemPath, anchorItemId)!)
  }
}

/**
 * アイテムをドキュメント順で1つ上に移動するコマンド。
 * 親が居ない場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemUpward() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths.first())
  // 1つ上のアイテムが存在しない場合は何もしない
  if (aboveItemPath === undefined) return

  const aboveItemParentItemId = ItemPath.getParentItemId(aboveItemPath)
  // 1つ上のアイテムがアクティブページである場合も何もしない
  if (aboveItemParentItemId === undefined) return

  // 1つ上のアイテムの上にアイテムを移動する
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, selectedItemId)
    // 1つ上のアイテムの兄になるようターゲットアイテムを配置
    CurrentState.insertPrevSiblingItem(aboveItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  // ターゲットアイテムパスを更新
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const newTargetItemPath = ItemPath.createSiblingItemPath(aboveItemPath, targetItemId)
  assertNonUndefined(newTargetItemPath)
  CurrentState.setTargetItemPathOnly(newTargetItemPath)
  // アンカーアイテムパスを更新
  const newAnchorItemPath = ItemPath.createSiblingItemPath(
    aboveItemPath,
    ItemPath.getItemId(CurrentState.getAnchorItemPath())
  )
  assertNonUndefined(newAnchorItemPath)
  CurrentState.setAnchorItemPath(newAnchorItemPath)

  // キャレット位置、テキスト選択範囲を維持する
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
}

/**
 * ドキュメント順でアイテムを1つ下に移動するコマンド。
 * すでに下端の場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemDownward() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを探索する
  const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(selectedItemPaths.last())
  // 該当アイテムがない場合（アイテムツリーの下端の場合）は何もしない
  if (firstFollowingItemPath === undefined) return

  // 1つ下のアイテムの下にアイテムを移動する
  for (const selectedItemPath of selectedItemPaths.reverse()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, selectedItemId)
    // アイテムを再配置
    CurrentState.insertBelowItem(firstFollowingItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  // キャレット位置、テキスト選択範囲を維持する
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

  if (CurrentState.getDisplayingChildItemIds(firstFollowingItemPath).isEmpty()) {
    // 1つ下のアイテムが子を表示していない場合

    // ターゲットアイテムパスを更新
    const newTargetItemPath = ItemPath.createSiblingItemPath(firstFollowingItemPath, targetItemId)
    assertNonUndefined(newTargetItemPath)
    CurrentState.setTargetItemPathOnly(newTargetItemPath)

    // アンカーアイテムパスを更新
    const newAnchorItemPath = ItemPath.createSiblingItemPath(
      firstFollowingItemPath,
      ItemPath.getItemId(CurrentState.getAnchorItemPath())
    )
    assertNonUndefined(newAnchorItemPath)
    CurrentState.setAnchorItemPath(newAnchorItemPath)
  } else {
    // 1つ下のアイテムが子を表示している場合

    // ターゲットアイテムパスを更新
    const newTargetItemPath = firstFollowingItemPath.push(targetItemId)
    CurrentState.setTargetItemPathOnly(newTargetItemPath)
    // アンカーアイテムパスを更新
    const newAnchorItemPath = firstFollowingItemPath.push(
      ItemPath.getItemId(CurrentState.getAnchorItemPath())
    )
    CurrentState.setAnchorItemPath(newAnchorItemPath)
  }
}

/**
 * 兄弟リスト内でアイテムを上に移動するコマンド。
 * 兄が居ない場合はmoveItemUpwardコマンドと等価。
 */
export function moveItemToPrevSibling() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(selectedItemPaths.first())
  if (prevSiblingItemPath !== undefined) {
    const targetItemParentItemId = ItemPath.getParentItemId(selectedItemPaths.first())
    // 兄が居るということは親が居るということ
    assertNonUndefined(targetItemParentItemId)

    for (const selectedItemPath of selectedItemPaths) {
      const selectedItemId = ItemPath.getItemId(selectedItemPath)
      // 既存の親子関係を削除
      const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId, selectedItemId)
      // 兄の上に配置
      CurrentState.insertPrevSiblingItem(prevSiblingItemPath, selectedItemId, edge)

      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // 兄弟リスト内での移動なのでfocusItemPathやanchorItemPathの更新は不要

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    moveItemUpward()
  }
}

/**
 * 兄弟リスト内でアイテムを下に移動するコマンド。
 * 弟が居ない場合はmoveItemDownwardコマンドと等価。
 */
export function moveItemToNextSibling() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const nextSiblingItemPath = CurrentState.findNextSiblingItemPath(selectedItemPaths.last())
  if (nextSiblingItemPath !== undefined) {
    const targetItemParentItemId = ItemPath.getParentItemId(selectedItemPaths.first())
    // 兄が居るということは親が居るということ
    assertNonUndefined(targetItemParentItemId)

    for (const selectedItemPath of selectedItemPaths) {
      const selectedItemId = ItemPath.getItemId(selectedItemPath)
      // 既存の親子関係を削除
      const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId, selectedItemId)
      // 弟の下に配置
      CurrentState.insertNextSiblingItem(nextSiblingItemPath, selectedItemId, edge)

      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // 兄弟リスト内での移動なのでfocusItemPathやanchorItemPathの更新は不要

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    moveItemDownward()
  }
}

/** アイテムツリー上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    const characterCount = InnerHtml.countCharacters(
      get(Internal.instance.state.textItems[targetItemId].innerHtml)
    )
    const textItemSelection = getTextItemSelectionFromDom()
    assertNonUndefined(textItemSelection)

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないのでキャレット位置によらず子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
      const innerHtml = InnerHtml.fromChildren(range.extractContents())
      CurrentState.setTextItemInnerHtml(
        targetItemId,
        InnerHtml.fromChildren(document.activeElement)
      )

      // 新規アイテムを最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)
      CurrentState.setTextItemInnerHtml(newItemId, innerHtml)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(targetItemPath.push(newItemId))
      External.instance.requestSetCaretDistanceAfterRendering(0)
      return
    }

    if (characterCount === 0) {
      // 空のテキストアイテムなら

      // 新規アイテムを下に追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
      External.instance.requestSetCaretDistanceAfterRendering(0)
    } else if (textItemSelection.focusDistance < characterCount / 2) {
      // キャレット位置が前半なら

      // キャレットより前のテキストをカットする
      const range = selection.getRangeAt(0)
      range.setStartBefore(document.activeElement.firstChild!)
      const innerHtml = InnerHtml.fromChildren(range.extractContents())
      CurrentState.setTextItemInnerHtml(
        targetItemId,
        InnerHtml.fromChildren(document.activeElement)
      )

      // 新規アイテムを兄として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertPrevSiblingItem(targetItemPath, newItemId)
      CurrentState.setTextItemInnerHtml(newItemId, innerHtml)

      // キャレット位置を更新する
      External.instance.requestSetCaretDistanceAfterRendering(0)
    } else {
      // キャレット位置が後半なら

      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
      const innerHtml = InnerHtml.fromChildren(range.extractContents())
      CurrentState.setTextItemInnerHtml(
        targetItemId,
        InnerHtml.fromChildren(document.activeElement)
      )

      // 新規アイテムを下に配置する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
      CurrentState.setTextItemInnerHtml(newItemId, innerHtml)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
      External.instance.requestSetCaretDistanceAfterRendering(0)
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // 新規アイテムを最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)

      // フォーカスを移す
      CurrentState.setTargetItemPath(targetItemPath.push(newItemId))
      return
    }

    // 新規アイテムを下に配置する
    const newItemId = CurrentState.createTextItem()
    const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

    // フォーカスを移す
    CurrentState.setTargetItemPath(newItemPath)
  }
}

/**
 * アイテムを削除するコマンド。
 * ターゲットアイテムがアクティブページの場合は何もしない。
 * トランスクルードされたアイテムの場合はエッジのみ削除する。
 */
export function removeEdge() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const parentItemId = ItemPath.getParentItemId(selectedItemPaths.first())

  // アクティブページを削除しようとしている場合、何もしない
  if (parentItemId === undefined) return

  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths.first())
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)

  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    if (CurrentState.countParents(selectedItemId) >= 2) {
      CurrentState.removeItemGraphEdge(parentItemId, selectedItemId)
    } else {
      CurrentState.deleteItem(selectedItemId)
    }
  }
}

/**
 * アイテムを削除するコマンド。
 * ターゲットアイテムがアクティブページの場合は何もしない。
 */
export function deleteItem() {
  // アクティブページを削除しようとしている場合、何もしない
  if (!ItemPath.hasParent(CurrentState.getTargetItemPath())) return

  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // 削除されるアイテムの上のアイテムをフォーカス
  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths.first())
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)

  // 対象アイテムを削除
  for (const selectedItemPath of selectedItemPaths) {
    CurrentState.deleteItem(ItemPath.getItemId(selectedItemPath))
  }
}

/**
 * アイテム単体を削除するコマンド。
 * 子アイテムは（アンインデントと同じように）親側に繰り上げられる。
 * ターゲットアイテムがアクティブページの場合は何もしない。
 */
export function deleteItemItself() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  // アクティブページを削除しようとしている場合、何もしない
  if (!ItemPath.hasParent(targetItemPath)) return

  const childItemIds = get(Internal.instance.state.items[targetItemId].childItemIds)
  if (childItemIds.isEmpty()) {
    // 上のアイテムをフォーカス
    const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
    assertNonUndefined(aboveItemPath)
    CurrentState.setTargetItemPath(aboveItemPath)
  } else {
    // 子がいる場合は最初の子をフォーカス
    const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, childItemIds.first())
    assertNonUndefined(newItemPath)
    CurrentState.setTargetItemPath(newItemPath)
  }

  CurrentState.deleteItemItself(targetItemId)
}

/**
 * ターゲットアイテムがページなら非ページ化する。
 * ターゲットアイテムが非ページならページ化する。
 */
export function togglePaged() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  if (get(Derived.isPage(targetItemId))) {
    CurrentState.unmountPage(targetItemId)
    CurrentState.turnIntoNonPage(targetItemId)
  } else {
    CurrentState.turnIntoPage(targetItemId)
  }
}

/** 対象アイテムがページなら、そのページに切り替える */
export function showPage() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  if (get(Derived.isPage(targetItemId))) {
    CurrentState.switchActivePage(targetItemId)
  }
}

/** 対象アイテムをページ化し、そのページに切り替える */
export function turnIntoAndShowPage() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  CurrentState.turnIntoPage(targetItemId)
  CurrentState.switchActivePage(targetItemId)
}

/** 対象を非ページ化し、expandする */
export function turnIntoNonPageAndExpand() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  CurrentState.unmountPage(targetItemId)
  CurrentState.turnIntoNonPage(targetItemId)

  CurrentState.setIsCollapsed(targetItemPath, false)
  CurrentState.updateItemTimestamp(targetItemId)
}

/**
 * 対象アイテムをグレーアウトする。
 * もし既にグレーアウト状態なら非グレーアウト状態に戻す。
 */
export function toggleGrayedOut() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const targetItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.toggleCssClass(targetItemId, 'grayed-out')

    // タイムスタンプを更新
    // TODO: 設定で無効化できるようにする
    CurrentState.updateItemTimestamp(targetItemId)
  }

  // フォーカスを下のアイテムに移動する。
  // これは複数のアイテムを連続でグレーアウトする際に有用な挙動である。
  const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(selectedItemPaths.last())
  if (firstFollowingItemPath !== undefined) {
    CurrentState.setTargetItemPath(firstFollowingItemPath)
    const firstFollowingItemId = ItemPath.getItemId(firstFollowingItemPath)
    if (Internal.instance.state.items[firstFollowingItemId].itemType === ItemType.TEXT) {
      External.instance.requestSetCaretDistanceAfterRendering(0)
    }
  }
}

/**
 * 対象アイテムをハイライトする。
 * もし既にハイライト状態なら非ハイライト状態に戻す。
 */
export function toggleHighlighted() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const targetItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.toggleCssClass(targetItemId, 'highlighted')

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)
  }
}
