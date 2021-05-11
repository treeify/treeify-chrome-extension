import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

/** ターゲットアイテムのisCollapsedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleCollapsed() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  CurrentState.setIsCollapsed(targetItemPath, !CurrentState.getIsCollapsed(targetItemPath))
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
  if (CurrentState.isPage(prevSiblingItemId)) return

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
    // フォーカスを移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(prevSiblingItemPath.push(targetItemId))
    )

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
    // フォーカスを移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    const siblingItemPath = ItemPath.createSiblingItemPath(parentItemPath, targetItemId)!
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(siblingItemPath)
    )

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
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
  // 1つ上のアイテムが存在しない場合は何もしない
  if (aboveItemPath === undefined) return

  const aboveItemParentItemId = ItemPath.getParentItemId(aboveItemPath)
  // 1つ上のアイテムがアクティブページである場合も何もしない
  if (aboveItemParentItemId === undefined) return

  // 下記の分岐が必要な理由（else節内の処理では兄弟順序入れ替えができない理由）：
  // 兄弟リスト内に同一アイテムが複数存在する状況は（CurrentStateの途中状態だったとしても）許容しない。
  // なぜならindexOfなどで不具合が起こることが目に見えているから。
  // そのため、旧エッジ削除の前に新エッジ追加を行ってはならない。
  // 一方、新エッジ追加の前に旧エッジ削除を行おうとしても、
  // 旧エッジを削除してしまうと「兄になるよう配置する処理」の基準を失ってしまう。
  // そのため、新エッジ追加と旧エッジ削除をバラバラに行うことはできず、下記の分岐が必要となる。

  if (aboveItemParentItemId === targetItemParentItemId) {
    // 1つ上のアイテムが兄である場合、兄弟リスト内を兄方向に1つ移動する
    CurrentState.moveToPrevSibling(targetItemPath)

    CurrentState.updateItemTimestamp(targetItemId)

    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(targetItemPath)
    )

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, targetItemId)
    // 1つ上のアイテムの兄になるようターゲットアイテムを配置
    CurrentState.insertPrevSiblingItem(aboveItemPath, targetItemId, edge)

    CurrentState.updateItemTimestamp(targetItemId)

    // フォーカスを移動先に更新する
    const newTargetItemPath = ItemPath.createSiblingItemPath(aboveItemPath, targetItemId)
    assertNonUndefined(newTargetItemPath)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newTargetItemPath)
    )

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  }
}

/**
 * ドキュメント順でアイテムを1つ下に移動するコマンド。
 * すでに下端の場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemDownward() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを探索する
  const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(targetItemPath)
  // 該当アイテムがない場合（アイテムツリーの下端の場合）は何もしない
  if (firstFollowingItemPath === undefined) return

  if (CurrentState.getDisplayingChildItemIds(firstFollowingItemPath).isEmpty()) {
    // 1つ下のアイテムが子を表示していない場合

    // 下記の分岐が必要な理由（else節内の処理では兄弟順序入れ替えができない理由）：
    // 兄弟リスト内に同一アイテムが複数存在する状況は（CurrentStateの途中状態だったとしても）許容しない。
    // なぜならindexOfなどで不具合が起こることが目に見えているから。
    // そのため、旧エッジ削除の前に新エッジ追加を行ってはならない。
    // 一方、新エッジ追加の前に旧エッジ削除を行おうとしても、
    // 旧エッジを削除してしまうと「兄になるよう配置する処理」の基準を失ってしまう。
    // そのため、新エッジ追加と旧エッジ削除をバラバラに行うことはできず、下記の分岐が必要となる。

    if (ItemPath.getParentItemId(firstFollowingItemPath) === targetItemParentItemId) {
      // 兄弟リスト内を弟方向に1つ移動する
      CurrentState.moveToNextSibling(targetItemPath)

      CurrentState.updateItemTimestamp(targetItemId)

      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath)
      )

      // キャレット位置、テキスト選択範囲を維持する
      External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
    } else {
      // 既存の親子関係を削除
      const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, targetItemId)
      // 弟になるようターゲットアイテムを配置
      CurrentState.insertNextSiblingItem(firstFollowingItemPath, targetItemId, edge)

      CurrentState.updateItemTimestamp(targetItemId)

      // フォーカスを移動先に更新する
      const newTargetItemPath = ItemPath.createSiblingItemPath(firstFollowingItemPath, targetItemId)
      assertNonUndefined(newTargetItemPath)
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(newTargetItemPath)
      )

      // キャレット位置、テキスト選択範囲を維持する
      External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
    }
  } else {
    // 1つ下のアイテムが子を表示している場合、最初の子になるよう移動する

    const parentItemId = ItemPath.getParentItemId(targetItemPath)
    const firstFollowingItemId = ItemPath.getItemId(firstFollowingItemPath)
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(parentItemId!, targetItemId)
    // 最初の子になるようターゲットアイテムを配置
    CurrentState.insertFirstChildItem(firstFollowingItemId, targetItemId, edge)

    CurrentState.updateItemTimestamp(targetItemId)

    // フォーカスを移動先に更新する
    const newTargetItemPath = firstFollowingItemPath.push(targetItemId)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newTargetItemPath)
    )

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  }
}

/**
 * 兄弟リスト内でアイテムを上に移動するコマンド。
 * 兄が居ない場合はmoveItemUpwardコマンドと等価。
 */
export function moveItemToPrevSibling() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(targetItemPath)
  if (prevSiblingItemPath !== undefined) {
    CurrentState.moveToPrevSibling(targetItemPath)

    CurrentState.updateItemTimestamp(ItemPath.getItemId(targetItemPath))

    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(targetItemPath)
    )

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
  const targetItemPath = CurrentState.getTargetItemPath()
  const nextSiblingItemPath = CurrentState.findNextSiblingItemPath(targetItemPath)
  if (nextSiblingItemPath !== undefined) {
    CurrentState.moveToNextSibling(targetItemPath)

    CurrentState.updateItemTimestamp(ItemPath.getItemId(targetItemPath))

    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(targetItemPath)
    )

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

    const characterCount = DomishObject.countCharacters(
      Internal.instance.state.textItems[targetItemId].domishObjects
    )
    const textItemSelection = getTextItemSelectionFromDom()
    assertNonUndefined(textItemSelection)

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないので子として追加する
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
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.push(newItemId))
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
      return
    }

    if (characterCount === 0) {
      // 空のテキストアイテムなら

      // 新規アイテムを弟として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertNextSiblingItem(targetItemPath, newItemId)

      // キャレット位置を更新する
      const siblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, newItemId)!
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(siblingItemPath)
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
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
      CurrentState.insertPrevSiblingItem(targetItemPath, newItemId)
      CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath)
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
    } else {
      // キャレット位置が後半なら

      if (!CurrentState.getDisplayingChildItemIds(targetItemPath).isEmpty()) {
        // もし子を表示しているなら

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
        External.instance.requestFocusAfterRendering(
          ItemTreeContentView.focusableDomElementId(targetItemPath.push(newItemId))
        )
        External.instance.requestSetCaretDistanceAfterRendering(0)
      } else {
        // もし子を表示していないなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())
        CurrentState.setTextItemDomishObjects(
          targetItemId,
          DomishObject.fromChildren(document.activeElement)
        )

        // 新規アイテムを弟として追加する
        const newItemId = CurrentState.createTextItem()
        CurrentState.insertNextSiblingItem(targetItemPath, newItemId)
        CurrentState.setTextItemDomishObjects(newItemId, domishObjects)

        // キャレット位置を更新する
        External.instance.requestFocusAfterRendering(
          ItemTreeContentView.focusableDomElementId(
            ItemPath.createSiblingItemPath(targetItemPath, newItemId)!
          )
        )
        External.instance.requestSetCaretDistanceAfterRendering(0)
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!ItemPath.hasParent(targetItemPath)) {
      // 新規アイテムを最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)

      // フォーカスを移す
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.push(newItemId))
      )
      return
    }

    if (!CurrentState.getDisplayingChildItemIds(targetItemPath).isEmpty()) {
      // もし子を表示しているなら
      // 新規アイテムを最初の子として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertFirstChildItem(targetItemId, newItemId)

      // フォーカスを移す
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.push(newItemId))
      )
    } else {
      // もし子を表示していないなら
      // 新規アイテムを弟として追加する
      const newItemId = CurrentState.createTextItem()
      CurrentState.insertNextSiblingItem(targetItemPath, newItemId)

      // フォーカスを移す
      const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, newItemId)!
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(newItemPath)
      )
    }
  }
}

/**
 * アイテムを削除するコマンド。
 * ターゲットアイテムがアクティブページの場合は何もしない。
 */
export function deleteItem() {
  const targetItemPath = CurrentState.getTargetItemPath()

  // アクティブページを削除しようとしている場合、何もしない
  if (!ItemPath.hasParent(targetItemPath)) return

  // 上のアイテムをフォーカス
  const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
  assertNonUndefined(aboveItemPath)
  External.instance.requestFocusAfterRendering(
    ItemTreeContentView.focusableDomElementId(aboveItemPath)
  )

  CurrentState.deleteItem(ItemPath.getItemId(targetItemPath))
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
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(aboveItemPath)
    )
  } else {
    // 子がいる場合は最初の子をフォーカス
    const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, childItemIds.first())
    assertNonUndefined(newItemPath)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newItemPath)
    )
  }

  CurrentState.deleteItemItself(targetItemId)
}

/**
 * ターゲットアイテムがページなら非ページ化する。
 * ターゲットアイテムが非ページならページ化する。
 */
export function togglePaged() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  if (CurrentState.isPage(targetItemId)) {
    CurrentState.unmountPage(targetItemId)
    CurrentState.turnIntoNonPage(targetItemId)
  } else {
    CurrentState.turnIntoPage(targetItemId)
  }
}

/** 対象アイテムがページなら、そのページに切り替える */
export function showPage() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

  if (CurrentState.isPage(targetItemId)) {
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
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(firstFollowingItemPath)
    )
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
