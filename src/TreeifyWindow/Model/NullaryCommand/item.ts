import {ItemType} from 'src/Common/basicType'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {NextState} from 'src/TreeifyWindow/Model/NextState'

/** フォーカスアイテムのisFoldedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleFolded() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  const focusedItemId = focusedItemPath.itemId
  NextState.setItemProperty(focusedItemId, 'isFolded', !NextState.getItemIsFolded(focusedItemId))
  NextState.updateItemTimestamp(focusedItemId)
}

/** アウトライナーのいわゆるインデント操作を実行するコマンド。 */
export function indentItem() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  const prevSiblingItemPath = NextState.findPrevSiblingItemPath(focusedItemPath)
  // 兄が居ない場合、何もしない
  if (prevSiblingItemPath === undefined) return

  // 兄がページの場合はアンフォールドできないので何もしない
  if (NextState.isPage(prevSiblingItemPath.itemId)) return

  // 兄をアンフォールドする
  NextState.setItemProperty(prevSiblingItemPath.itemId, 'isFolded', false)

  // 兄の最後の子になるようフォーカスアイテムを配置
  NextState.insertLastChildItem(prevSiblingItemPath.itemId, focusedItemPath.itemId)

  // 既存の親子関係を削除
  assertNonUndefined(focusedItemPath.parentItemId)
  NextState.removeItemGraphEdge(focusedItemPath.parentItemId, focusedItemPath.itemId)

  NextState.updateItemTimestamp(focusedItemPath.itemId)

  // フォーカスアイテムパスを移動先に更新する
  NextState.setFocusedItemPath(prevSiblingItemPath.createChildItemPath(focusedItemPath.itemId))
}

/** アウトライナーのいわゆるアンインデント操作を実行するコマンド。 */
export function unindentItem() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  // 親または親の親が居ない場合は何もしない
  if (focusedItemPath.parent === undefined) return
  if (focusedItemPath.parent.parent === undefined) return

  // 既存の親子関係を削除
  const focusedItemId = focusedItemPath.itemId
  NextState.removeItemGraphEdge(focusedItemPath.parent.itemId, focusedItemId)

  // 親の弟として配置する
  NextState.insertNextSiblingItem(focusedItemPath.parent, focusedItemId)

  NextState.updateItemTimestamp(focusedItemPath.itemId)

  // フォーカスアイテムパスを移動先に更新する
  NextState.setFocusedItemPath(focusedItemPath.parent.createSiblingItemPath(focusedItemId)!!)
}

/**
 * アイテムをドキュメント順で1つ上に移動するコマンド。
 * 親が居ない場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemUpward() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  const aboveItemPath = NextState.findAboveItemPath(focusedItemPath)
  // 1つ上のアイテムが存在しない場合は何もしない
  if (aboveItemPath === undefined) return
  // 1つ上のアイテムがアクティブページである場合も何もしない
  if (aboveItemPath.parentItemId === undefined) return

  // 下記の分岐が必要な理由（else節内の処理では兄弟順序入れ替えができない理由）：
  // 兄弟リスト内に同一アイテムが複数存在する状況は（NextStateの途中状態だったとしても）許容しない。
  // なぜならindexOfなどで不具合が起こることが目に見えているから。
  // そのため、旧エッジ削除の前に新エッジ追加を行ってはならない。
  // 一方、新エッジ追加の前に旧エッジ削除を行おうとしても、
  // 旧エッジを削除してしまうと「兄になるよう配置する処理」の基準を失ってしまう。
  // そのため、新エッジ追加と旧エッジ削除をバラバラに行うことはできず、下記の分岐が必要となる。

  if (aboveItemPath.parentItemId === focusedItemPath.parentItemId) {
    // 1つ上のアイテムが兄である場合、兄弟リスト内を兄方向に1つ移動する
    NextState.moveToPrevSibling(focusedItemPath)

    NextState.updateItemTimestamp(focusedItemPath.itemId)

    // 兄弟リスト内での入れ替えだけならフォーカスアイテムパスは変化しないので更新不要
  } else {
    // 1つ上のアイテムの兄になるようフォーカスアイテムを配置
    NextState.insertPrevSiblingItem(aboveItemPath, focusedItemPath.itemId)

    // 既存の親子関係を削除
    NextState.removeItemGraphEdge(focusedItemPath.parentItemId!!, focusedItemPath.itemId)

    NextState.updateItemTimestamp(focusedItemPath.itemId)

    // フォーカスアイテムパスを移動先に更新する
    const newFocusedItemPath = aboveItemPath.createSiblingItemPath(focusedItemPath.itemId)
    assertNonUndefined(newFocusedItemPath)
    NextState.setFocusedItemPath(newFocusedItemPath)
  }
}

/**
 * ドキュメント順でアイテムを1つ下に移動するコマンド。
 * すでに下端の場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemDownward() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを探索する
  const firstFollowingItemPath = NextState.findFirstFollowingItemPath(focusedItemPath)
  // 該当アイテムがない場合（アイテムツリーの下端の場合）は何もしない
  if (firstFollowingItemPath === undefined) return

  if (NextState.getDisplayingChildItemIds(firstFollowingItemPath.itemId).isEmpty()) {
    // 1つ下のアイテムが子を表示していない場合

    // 下記の分岐が必要な理由（else節内の処理では兄弟順序入れ替えができない理由）：
    // 兄弟リスト内に同一アイテムが複数存在する状況は（NextStateの途中状態だったとしても）許容しない。
    // なぜならindexOfなどで不具合が起こることが目に見えているから。
    // そのため、旧エッジ削除の前に新エッジ追加を行ってはならない。
    // 一方、新エッジ追加の前に旧エッジ削除を行おうとしても、
    // 旧エッジを削除してしまうと「兄になるよう配置する処理」の基準を失ってしまう。
    // そのため、新エッジ追加と旧エッジ削除をバラバラに行うことはできず、下記の分岐が必要となる。

    if (firstFollowingItemPath.parentItemId === focusedItemPath.parentItemId) {
      // 兄弟リスト内を弟方向に1つ移動する
      NextState.moveToNextSibling(focusedItemPath)

      NextState.updateItemTimestamp(focusedItemPath.itemId)

      // 兄弟リスト内での入れ替えだけならフォーカスアイテムパスは変化しないので更新不要
    } else {
      // 弟になるようフォーカスアイテムを配置
      NextState.insertNextSiblingItem(firstFollowingItemPath, focusedItemPath.itemId)

      // 既存の親子関係を削除
      NextState.removeItemGraphEdge(focusedItemPath.parentItemId!!, focusedItemPath.itemId)

      NextState.updateItemTimestamp(focusedItemPath.itemId)

      // フォーカスアイテムパスを移動先に更新する
      const newFocusedItemPath = firstFollowingItemPath.createSiblingItemPath(
        focusedItemPath.itemId
      )
      assertNonUndefined(newFocusedItemPath)
      NextState.setFocusedItemPath(newFocusedItemPath)
    }
  } else {
    // 1つ下のアイテムが子を表示している場合、最初の子になるよう移動する

    // 最初の子になるようフォーカスアイテムを配置
    NextState.insertFirstChildItem(firstFollowingItemPath.itemId, focusedItemPath.itemId)

    // 既存の親子関係を削除
    NextState.removeItemGraphEdge(focusedItemPath.parentItemId!!, focusedItemPath.itemId)

    NextState.updateItemTimestamp(focusedItemPath.itemId)

    // フォーカスアイテムパスを移動先に更新する
    const newFocusedItemPath = firstFollowingItemPath.createChildItemPath(focusedItemPath.itemId)
    NextState.setFocusedItemPath(newFocusedItemPath)
  }
}

/** アイテムツリー上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  if (NextState.getItemType(focusedItemPath.itemId) === ItemType.TEXT) {
    // フォーカスアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    const characterCount = DomishObject.countCharacters(
      NextState.getTextItemDomishObjects(focusedItemPath.itemId)
    )
    const textItemSelection = NextState.getItemTreeTextItemSelection()
    assertNonNull(textItemSelection)
    if (characterCount === 0) {
      // 空のテキストアイテムなら

      // 新規アイテムを弟として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertNextSiblingItem(focusedItemPath, newItemId)

      // キャレット位置を更新する
      NextState.setFocusedItemPath(focusedItemPath.createSiblingItemPath(newItemId)!!)
      NextState.setItemTreeTextItemCaretDistance(0)
    } else if (textItemSelection.focusDistance < characterCount / 2) {
      // キャレット位置が前半なら

      // キャレットより前のテキストをカットする
      const range = selection.getRangeAt(0)
      range.setStartBefore(document.activeElement.firstChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      NextState.setTextItemDomishObjects(
        focusedItemPath.itemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規アイテムを兄として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertPrevSiblingItem(focusedItemPath, newItemId)
      NextState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      NextState.setFocusedItemPath(focusedItemPath.createSiblingItemPath(newItemId)!!)
      NextState.setItemTreeTextItemCaretDistance(DomishObject.countCharacters(domishObjects))
    } else {
      // キャレット位置が後半なら

      if (!NextState.getDisplayingChildItemIds(focusedItemPath.itemId).isEmpty()) {
        // もし子を表示しているなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())
        NextState.setTextItemDomishObjects(
          focusedItemPath.itemId,
          DomishObject.fromChildren(document.activeElement)
        )

        // 新規アイテムを最初の子として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertFirstChildItem(focusedItemPath.itemId, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // キャレット位置を更新する
        NextState.setFocusedItemPath(focusedItemPath.createChildItemPath(newItemId))
        NextState.setItemTreeTextItemCaretDistance(0)
      } else {
        // もし子を表示していないなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())
        NextState.setTextItemDomishObjects(
          focusedItemPath.itemId,
          DomishObject.fromChildren(document.activeElement)
        )

        // 新規アイテムを弟として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertNextSiblingItem(focusedItemPath, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // キャレット位置を更新する
        NextState.setFocusedItemPath(focusedItemPath.createSiblingItemPath(newItemId)!!)
        NextState.setItemTreeTextItemCaretDistance(0)
      }
    }
  } else {
    // フォーカスアイテムがテキストアイテム以外の場合

    if (!NextState.getDisplayingChildItemIds(focusedItemPath.itemId).isEmpty()) {
      // もし子を表示しているなら
      // 新規アイテムを最初の子として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertFirstChildItem(focusedItemPath.itemId, newItemId)

      // フォーカスアイテムを更新する
      NextState.setFocusedItemPath(focusedItemPath.createChildItemPath(newItemId))
    } else {
      // もし子を表示していないなら
      // 新規アイテムを弟として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertNextSiblingItem(focusedItemPath, newItemId)

      // フォーカスアイテムを更新する
      NextState.setFocusedItemPath(focusedItemPath.createSiblingItemPath(newItemId)!!)
    }
  }
}

/**
 * アイテムを削除するコマンド。
 * フォーカスアイテムがアクティブページの場合は何もしない。
 */
export function deleteItem() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  // アクティブページを削除しようとしている場合、何もしない
  if (focusedItemPath.parent === null) return

  // 新たなフォーカスアイテムとして上のアイテムを指定
  const aboveItemPath = NextState.findAboveItemPath(focusedItemPath)
  assertNonUndefined(aboveItemPath)
  NextState.setFocusedItemPath(aboveItemPath)

  NextState.deleteItem(focusedItemPath.itemId)
}

/** contenteditableな要素で改行を実行する */
export function insertLineBreak() {
  document.execCommand('insertLineBreak')
}

/**
 * フォーカスアイテムがページなら非ページ化する。
 * フォーカスアイテムが非ページならページ化する。
 */
export function togglePaged() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  if (NextState.isPage(focusedItemPath.itemId)) {
    NextState.becomeNonPage(focusedItemPath.itemId)
  } else {
    NextState.becomePage(focusedItemPath.itemId)
  }
}

/**
 * グレーアウトする。
 * もし既にグレーアウト状態なら非グレーアウト状態に戻す。
 */
export function toggleGrayedOut() {
  const focusedItemPath = NextState.getLastFocusedItemPath()
  if (focusedItemPath === null) return

  NextState.toggleCssClass(focusedItemPath.itemId, 'grayed-out-item')

  // タイムスタンプを更新
  // TODO: 設定で無効化できるようにする
  NextState.updateItemTimestamp(focusedItemPath.itemId)

  // フォーカスを移動する。
  // これは複数のアイテムを連続でグレーアウトする際に有用な挙動である。
  const nextSiblingItemPath = NextState.findFirstFollowingItemPath(focusedItemPath)
  if (nextSiblingItemPath !== undefined) {
    NextState.setFocusedItemPath(nextSiblingItemPath)
    if (NextState.getItemType(nextSiblingItemPath.itemId) === ItemType.TEXT) {
      NextState.setItemTreeTextItemCaretDistance(0)
    } else {
      NextState.setItemTreeTextItemSelection(null)
    }
  }
}
