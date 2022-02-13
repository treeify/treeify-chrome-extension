import { ItemType } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { Command } from 'src/TreeifyTab/Internal/Command/index'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Source } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { NERArray$, RArray$ } from 'src/Utility/fp-ts'

/** 選択された項目を折りたたむコマンド */
export function fold() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  if (ItemPath.hasParent(selectedItemPaths[0])) {
    for (const selectedItemPath of selectedItemPaths) {
      CurrentState.setIsFolded(selectedItemPath, true)
      CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
    }
  }
}

/** 選択された項目を展開するコマンド */
export function unfold() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  if (ItemPath.hasParent(selectedItemPaths[0])) {
    for (const selectedItemPath of selectedItemPaths) {
      CurrentState.setIsFolded(selectedItemPath, false)
      CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
    }
  }
}

/** ターゲット項目のisFoldedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleFolded() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  if (ItemPath.hasParent(selectedItemPaths[0])) {
    for (const selectedItemPath of selectedItemPaths) {
      CurrentState.setIsFolded(selectedItemPath, !CurrentState.getIsFolded(selectedItemPath))
      CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
    }
  }
}

/** メインエリア上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  // 複数選択時は何もしない
  if (CurrentState.getSelectedItemPaths().length > 1) return

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const textItemSelection = getTextItemSelectionFromDom()

  if (
    Internal.instance.state.items[targetItemId].type === ItemType.TEXT &&
    textItemSelection !== undefined
  ) {
    // ターゲット項目がテキスト項目の場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    // ターゲット項目がアクティブページだった場合は兄弟として追加できないのでキャレット位置によらず子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      if (document.activeElement.lastChild !== null) {
        range.setEndAfter(document.activeElement.lastChild)
      }
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規項目を最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(RArray$.append(newItemId)(targetItemPath))
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.requestToScrollBelow()
      return
    }

    const textLength = DomishObject.getTextLength(
      Internal.instance.state.textItems[targetItemId].domishObjects
    )

    if (textLength === 0) {
      // 空のテキスト項目なら

      // 新規項目を下に追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.requestToScrollBelow()
    } else if (textItemSelection.focusDistance < textLength / 2) {
      // キャレット位置が前半なら

      // キャレットより前のテキストをカットする
      const range = selection.getRangeAt(0)
      range.setStartBefore(document.activeElement.firstChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規項目を兄として追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertPrevSiblingItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレットが先頭にある場合のみ新規項目をフォーカスする。
      // WorkFlowyと同じ挙動。
      if (textItemSelection.focusDistance === 0) {
        CurrentState.setTargetItemPath(newItemPath)
      }
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.requestToScrollBelow()
    } else {
      // キャレット位置が後半なら

      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規項目を下に配置する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.requestToScrollBelow()
    }
  } else {
    // ターゲット項目がテキスト項目以外の場合

    // ターゲット項目がアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // 新規項目を最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)

      // フォーカスを移す
      CurrentState.setTargetItemPath(RArray$.append(newItemId)(targetItemPath))
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.requestToScrollBelow()
      return
    }

    // 新規項目を下に配置する
    const newItemId = CurrentState.createTextItem()
    const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

    // フォーカスを移す
    CurrentState.setTargetItemPath(newItemPath)
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.requestToScrollBelow()
  }
}

/**
 * 項目を削除するコマンド。
 * ターゲット項目がアクティブページの場合は何もしない。
 */
export function deleteItem() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // アクティブページを削除しようとしている場合、何もしない
  if (!ItemPath.hasParent(selectedItemPaths[0])) return

  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths[0])
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)
  Rerenderer.instance.requestToScrollAbove()

  // 上の項目がテキスト項目の場合、キャレットを末尾に移動する
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].type === ItemType.TEXT) {
    const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const textLength = DomishObject.getTextLength(domishObjects)
    Rerenderer.instance.requestToSetCaretPosition(textLength)
  } else {
    Rerenderer.instance.requestToFocusTargetItem()
  }

  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    CurrentState.deleteItem(selectedItemId)
  }
}

/**
 * 項目を削除するコマンド。
 * ターゲット項目がアクティブページの場合は何もしない。
 * トランスクルードされた項目の場合はエッジのみ削除する。
 */
export function removeItem() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const parentItemId = ItemPath.getParentItemId(selectedItemPaths[0])

  // アクティブページを削除しようとしている場合、何もしない
  if (parentItemId === undefined) return

  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths[0])
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)
  Rerenderer.instance.requestToScrollAbove()

  // 上の項目がテキスト項目の場合、キャレットを末尾に移動する
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].type === ItemType.TEXT) {
    const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const textLength = DomishObject.getTextLength(domishObjects)
    Rerenderer.instance.requestToSetCaretPosition(textLength)
  } else {
    Rerenderer.instance.requestToFocusTargetItem()
  }

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
 * 項目単体を削除するコマンド。
 * 子項目は（アンインデントと同じように）親側に繰り上げられる。
 * ターゲット項目がアクティブページの場合は何もしない。
 */
export function deleteJustOneItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const parentItemId = ItemPath.getParentItemId(targetItemPath)

  // アクティブページを削除しようとしている場合、何もしない
  if (parentItemId === undefined) return

  const childItemIds = Internal.instance.state.items[targetItemId].childItemIds
  if (childItemIds.length === 0) {
    // 上の項目をフォーカス
    const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
    assertNonUndefined(aboveItemPath)
    CurrentState.setTargetItemPath(aboveItemPath)
    Rerenderer.instance.requestToScrollAbove()

    const aboveItemId = ItemPath.getItemId(aboveItemPath)
    if (Internal.instance.state.items[aboveItemId].type === ItemType.TEXT) {
      const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
      const textLength = DomishObject.getTextLength(domishObjects)
      Rerenderer.instance.requestToSetCaretPosition(textLength)
    } else {
      Rerenderer.instance.requestToFocusTargetItem()
    }
  } else {
    // 子がいる場合

    for (const childItemId of childItemIds) {
      CurrentState.throwIfCantInsertChildItem(parentItemId, childItemId)
    }

    // 最初の子をフォーカス
    const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, childItemIds[0])
    assertNonUndefined(newItemPath)
    CurrentState.setTargetItemPath(newItemPath)
    Rerenderer.instance.requestToScrollAbove()
    Rerenderer.instance.requestToFocusTargetItem()
  }

  CurrentState.deleteItem(targetItemId, true)
}

/**
 * 対象項目を完了状態にする。
 * もし既に完了状態なら非完了状態に戻す。
 */
export function toggleCompleted() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId)

  const existsNonCompletedItem = selectedItemIds.some((itemId) => {
    return !Internal.instance.state.items[itemId].cssClasses.includes('completed')
  })
  if (existsNonCompletedItem) {
    // 選択された項目の中に非完了状態のものが含まれる場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.addCssClass(selectedItemId, 'completed')

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // ヒューリスティックな追加効果

    Command.closeTreeTabs()

    // 全てのトランスクルード元を折りたたむ
    for (const selectedItemId of selectedItemIds) {
      for (const parentItemId of CurrentState.getParentItemIds(selectedItemId)) {
        CurrentState.setIsFolded([parentItemId, selectedItemId], true)
      }
      CurrentState.updateItemTimestamp(selectedItemId)
    }

    const bottomSelectedItemPath = NERArray$.last(selectedItemPaths)
    const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(bottomSelectedItemPath)
    if (firstFollowingItemPath !== undefined) {
      // フォーカスを下の項目に移動する
      CurrentState.setTargetItemPath(firstFollowingItemPath)
      Rerenderer.instance.requestToFocusTargetItem()
    }
  } else {
    // 選択された項目が全て完了状態の場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.toggleCssClass(selectedItemId, 'completed')

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(selectedItemId)
    }
  }
}

/**
 * 対象項目をハイライトする。
 * もし既にハイライト状態なら非ハイライト状態に戻す。
 */
export function toggleHighlighted() {
  toggleCssClass('highlighted')
}

/**
 * 対象項目にダウトフル状態にする。
 * もし既にダウトフル状態なら非ダウトフル状態に戻す。
 */
export function toggleDoubtful() {
  toggleCssClass('doubtful')
}

function toggleCssClass(cssClass: string) {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId)

  const everyoneContainsTheCssClass = selectedItemIds.every((itemId) => {
    return Internal.instance.state.items[itemId].cssClasses.includes(cssClass)
  })
  if (!everyoneContainsTheCssClass) {
    // 選択された項目の中に該当状態ではない項目が含まれる場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.addCssClass(selectedItemId, cssClass)

      CurrentState.updateItemTimestamp(selectedItemId)
    }
  } else {
    // 選択された項目が全て該当状態の場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.toggleCssClass(selectedItemId, cssClass)

      CurrentState.updateItemTimestamp(selectedItemId)
    }
  }
}

/**
 * 対象項目が出典付きなら出典情報を削除する。
 * 出典がない場合はタイトル、URLともに空文字列の出典情報を付ける。
 */
export function toggleSource() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    if (Internal.instance.state.items[selectedItemId].source === null) {
      const emptySource: Source = { title: '', url: '' }
      Internal.instance.mutate(emptySource, StatePath.of('items', selectedItemId, 'source'))
    } else {
      Internal.instance.mutate(null, StatePath.of('items', selectedItemId, 'source'))
    }

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(selectedItemId)
  }
}
