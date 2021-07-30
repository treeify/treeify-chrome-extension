import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyTab/basicType'
import {getTextItemSelectionFromDom} from 'src/TreeifyTab/External/domTextSelection'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Cite, ListView, TableView} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

/** 選択された項目を折りたたむコマンド */
export function collapseItem() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    CurrentState.setIsCollapsed(selectedItemPath, true)
    CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
  }
}

/** 選択された項目を展開するコマンド */
export function expandItem() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    CurrentState.setIsCollapsed(selectedItemPath, false)
    CurrentState.updateItemTimestamp(ItemPath.getItemId(selectedItemPath))
  }
}

/** ターゲット項目のisCollapsedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleCollapsed() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  CurrentState.setIsCollapsed(targetItemPath, !CurrentState.getIsCollapsed(targetItemPath))
  CurrentState.updateItemTimestamp(targetItemId)
}

/** メインエリア上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  // 複数選択時は何もしない
  if (CurrentState.getSelectedItemPaths().size > 1) return

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  if (Internal.instance.state.items[targetItemId].type === ItemType.TEXT) {
    // ターゲット項目がテキスト項目の場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    const characterCount = DomishObject.countCharacters(
      Internal.instance.state.textItems[targetItemId].domishObjects
    )
    const textItemSelection = getTextItemSelectionFromDom()
    assertNonUndefined(textItemSelection)

    // ターゲット項目がアクティブページだった場合は兄弟として追加できないのでキャレット位置によらず子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
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
      CurrentState.setTargetItemPath(targetItemPath.push(newItemId))
      return
    }

    if (characterCount === 0) {
      // 空のテキスト項目なら

      // 新規項目を下に追加する
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

      // 新規項目を兄として追加する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertPrevSiblingItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレットが先頭にある場合のみ新規項目をフォーカスする。
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

      // 新規項目を下に配置する
      const newItemId = CurrentState.createTextItem()
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(newItemPath)
    }
  } else {
    // ターゲット項目がテキスト項目以外の場合

    // ターゲット項目がアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // 新規項目を最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)

      // フォーカスを移す
      CurrentState.setTargetItemPath(targetItemPath.push(newItemId))
      return
    }

    // 新規項目を下に配置する
    const newItemId = CurrentState.createTextItem()
    const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

    // フォーカスを移す
    CurrentState.setTargetItemPath(newItemPath)
  }
}

/**
 * 項目を削除するコマンド。
 * ターゲット項目がアクティブページの場合は何もしない。
 * トランスクルードされた項目の場合はエッジのみ削除する。
 */
export function removeEdge() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const parentItemId = ItemPath.getParentItemId(selectedItemPaths.first())

  // アクティブページを削除しようとしている場合、何もしない
  if (parentItemId === undefined) return

  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths.first())
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)

  // 上の項目がテキスト項目の場合、キャレットを末尾に移動する
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].type === ItemType.TEXT) {
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
 * 項目単体を削除するコマンド。
 * 子項目は（アンインデントと同じように）親側に繰り上げられる。
 * ターゲット項目がアクティブページの場合は何もしない。
 */
export function deleteItemItself() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  // アクティブページを削除しようとしている場合、何もしない
  if (!ItemPath.hasParent(targetItemPath)) return

  const childItemIds = Internal.instance.state.items[targetItemId].childItemIds
  if (childItemIds.isEmpty()) {
    // 上の項目をフォーカス
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
 * 対象項目をグレーアウトする。
 * もし既にグレーアウト状態なら非グレーアウト状態に戻す。
 */
export function toggleGrayedOut() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId)

  const existsNonGrayedOutItem = selectedItemIds.some((itemId) => {
    return !Internal.instance.state.items[itemId].cssClasses.contains('grayed-out')
  })
  if (existsNonGrayedOutItem) {
    // 選択された項目の中に非グレーアウト状態のものが含まれる場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.addCssClass(selectedItemId, 'grayed-out')

      // タイムスタンプを更新
      // TODO: 設定で無効化できるようにする
      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // フォーカスを下の項目に移動する
    // TODO: コマンドを分離する
    const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(selectedItemPaths.last())
    if (firstFollowingItemPath !== undefined) {
      CurrentState.setTargetItemPath(firstFollowingItemPath)
    }
  } else {
    // 選択された項目が全てグレーアウト状態の場合

    for (const selectedItemId of selectedItemIds) {
      CurrentState.toggleCssClass(selectedItemId, 'grayed-out')

      // タイムスタンプを更新
      // TODO: 設定で無効化できるようにする
      CurrentState.updateItemTimestamp(selectedItemId)
    }
  }
}

/**
 * 対象項目をハイライトする。
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
 * 対象項目にダウトフル状態にする。
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
 * 対象項目が出典付きなら出典情報を削除する。
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

export function toggleTableView() {
  for (const selectedItemPath of CurrentState.getSelectedItemPaths()) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    if (Internal.instance.state.items[selectedItemId].view.type !== 'table') {
      const tableView: TableView = {type: 'table'}
      Internal.instance.mutate(tableView, PropertyPath.of('items', selectedItemId, 'view'))
    } else {
      const listView: ListView = {type: 'list'}
      Internal.instance.mutate(listView, PropertyPath.of('items', selectedItemId, 'view'))
    }
  }
}
