import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyTab/basicType'
import {getTextItemSelectionFromDom} from 'src/TreeifyTab/External/domTextSelection'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Cite} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

/** 選択されたアイテムを折りたたむコマンド */
export function collapseItem() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    CurrentState.setIsCollapsed(selectedItemPath, true)
    CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
  }
}

/** ターゲットアイテムのisCollapsedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleCollapsed() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  CurrentState.setIsCollapsed(targetItemPath, !CurrentState.getIsCollapsed(targetItemPath))
  CurrentState.updateItemTimestamp(targetItemId)
}

/** メインエリア上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    const characterCount = DomishObject.countCharacters(
      Internal.instance.state.textItems[targetItemId].domishObjects
    )
    const textItemSelection = getTextItemSelectionFromDom()
    assertNonUndefined(textItemSelection)

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないのでキャレット位置によらず子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規アイテムを最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(targetItemPath.push(newItemId))
      return
    }

    if (characterCount === 0) {
      // 空のテキストアイテムなら

      // 新規アイテムを下に追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
    } else if (textItemSelection.focusDistance < characterCount / 2) {
      // キャレット位置が前半なら

      // キャレットより前のテキストをカットする
      const range = selection.getRangeAt(0)
      range.setStartBefore(document.activeElement.firstChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規アイテムを兄として追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertPrevSiblingItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレットが先頭にある場合のみ新規アイテムをフォーカスする。
      // WorkFlowyと同じ挙動。
      if (textItemSelection.focusDistance === 0) {
        CurrentState.setTargetItemPath(newItemPath)
      }
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

      // 新規アイテムを下に配置する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
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

  // 上のアイテムがテキストアイテムの場合、キャレットを末尾に移動する
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].itemType === ItemType.TEXT) {
    const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const characterCount = DomishObject.countCharacters(domishObjects)
    Rerenderer.instance.requestSetCaretDistanceAfterRendering(characterCount)
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

  // 上のアイテムがテキストアイテムの場合、キャレットを末尾に移動する
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].itemType === ItemType.TEXT) {
    const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const characterCount = DomishObject.countCharacters(domishObjects)
    Rerenderer.instance.requestSetCaretDistanceAfterRendering(characterCount)
  }

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

  const childItemIds = Internal.instance.state.items[targetItemId].childItemIds
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
 * 対象アイテムをグレーアウトする。
 * もし既にグレーアウト状態なら非グレーアウト状態に戻す。
 */
export function toggleGrayedOut() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.toggleCssClass(selectedItemId, 'grayed-out')

    // タイムスタンプを更新
    // TODO: 設定で無効化できるようにする
    CurrentState.updateItemTimestamp(selectedItemId)
  }

  // フォーカスを下のアイテムに移動する
  // TODO: コマンドを分離する
  const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(selectedItemPaths.last())
  if (firstFollowingItemPath !== undefined) {
    CurrentState.setTargetItemPath(firstFollowingItemPath)
  }
}

/**
 * 対象アイテムをハイライトする。
 * もし既にハイライト状態なら非ハイライト状態に戻す。
 */
export function toggleHighlighted() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.toggleCssClass(selectedItemId, 'highlighted')

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(selectedItemId)
  }
}

/**
 * 対象アイテムにダウトフル状態にする。
 * もし既にダウトフル状態なら非ダウトフル状態に戻す。
 */
export function toggleDoubtful() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    CurrentState.toggleCssClass(selectedItemId, 'doubtful')

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(selectedItemId)
  }
}

/**
 * 対象アイテムが出典付きなら出典情報を削除する。
 * 出典がない場合はタイトル、URLともに空文字列の出典情報を付ける。
 */
export function toggleCitation() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    if (Internal.instance.state.items[selectedItemId].cite === null) {
      const emptyCite: Cite = {title: '', url: ''}
      Internal.instance.mutate(emptyCite, PropertyPath.of('items', selectedItemId, 'cite'))
    } else {
      Internal.instance.mutate(null, PropertyPath.of('items', selectedItemId, 'cite'))
    }

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(selectedItemId)
  }
}
