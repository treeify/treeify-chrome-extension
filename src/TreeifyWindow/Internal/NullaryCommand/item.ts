import {ItemType} from 'src/Common/basicType'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {External} from 'src/TreeifyWindow/External/External'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'

/** ターゲットアイテムのisFoldedがtrueならfalseに、falseならtrueにするコマンド */
export function toggleFolded() {
  const focusedItemId = NextState.getTargetItemPath().itemId
  NextState.setItemProperty(focusedItemId, 'isFolded', !NextState.getItemIsFolded(focusedItemId))
  NextState.updateItemTimestamp(focusedItemId)
}

/** アウトライナーのいわゆるインデント操作を実行するコマンド。 */
export function indentItem() {
  const targetItemPath = NextState.getTargetItemPath()

  const prevSiblingItemPath = NextState.findPrevSiblingItemPath(targetItemPath)
  // 兄が居ない場合、何もしない
  if (prevSiblingItemPath === undefined) return

  // 兄がページの場合はアンフォールドできないので何もしない
  if (NextState.isPage(prevSiblingItemPath.itemId)) return

  // 兄をアンフォールドする
  NextState.setItemProperty(prevSiblingItemPath.itemId, 'isFolded', false)

  // 兄の最後の子になるようターゲットアイテムを配置
  NextState.insertLastChildItem(prevSiblingItemPath.itemId, targetItemPath.itemId)

  // 既存の親子関係を削除
  assertNonUndefined(targetItemPath.parentItemId)
  NextState.removeItemGraphEdge(targetItemPath.parentItemId, targetItemPath.itemId)

  NextState.updateItemTimestamp(targetItemPath.itemId)

  // フォーカスを移動先に更新する
  External.instance.requestFocusAfterRendering(
    ItemTreeContentView.focusableDomElementId(
      prevSiblingItemPath.createChildItemPath(targetItemPath.itemId)
    )
  )

  // キャレット位置、テキスト選択範囲を維持する
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
}

/** アウトライナーのいわゆるアンインデント操作を実行するコマンド。 */
export function unindentItem() {
  const targetItemPath = NextState.getTargetItemPath()

  // 親または親の親が居ない場合は何もしない
  if (targetItemPath.parent === undefined) return
  if (targetItemPath.parent.parent === undefined) return

  // 既存の親子関係を削除
  const focusedItemId = targetItemPath.itemId
  NextState.removeItemGraphEdge(targetItemPath.parent.itemId, focusedItemId)

  // 親の弟として配置する
  NextState.insertNextSiblingItem(targetItemPath.parent, focusedItemId)

  NextState.updateItemTimestamp(targetItemPath.itemId)

  // フォーカスを移動先に更新する
  External.instance.requestFocusAfterRendering(
    ItemTreeContentView.focusableDomElementId(
      targetItemPath.parent.createSiblingItemPath(focusedItemId)!!
    )
  )

  // キャレット位置、テキスト選択範囲を維持する
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
}

/**
 * アイテムをドキュメント順で1つ上に移動するコマンド。
 * 親が居ない場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemUpward() {
  const targetItemPath = NextState.getTargetItemPath()

  const aboveItemPath = NextState.findAboveItemPath(targetItemPath)
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

  if (aboveItemPath.parentItemId === targetItemPath.parentItemId) {
    // 1つ上のアイテムが兄である場合、兄弟リスト内を兄方向に1つ移動する
    NextState.moveToPrevSibling(targetItemPath)

    NextState.updateItemTimestamp(targetItemPath.itemId)

    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(targetItemPath)
    )

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  } else {
    // 1つ上のアイテムの兄になるようターゲットアイテムを配置
    NextState.insertPrevSiblingItem(aboveItemPath, targetItemPath.itemId)

    // 既存の親子関係を削除
    NextState.removeItemGraphEdge(targetItemPath.parentItemId!!, targetItemPath.itemId)

    NextState.updateItemTimestamp(targetItemPath.itemId)

    // フォーカスを移動先に更新する
    const newTargetItemPath = aboveItemPath.createSiblingItemPath(targetItemPath.itemId)
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
  const targetItemPath = NextState.getTargetItemPath()

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを探索する
  const firstFollowingItemPath = NextState.findFirstFollowingItemPath(targetItemPath)
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

    if (firstFollowingItemPath.parentItemId === targetItemPath.parentItemId) {
      // 兄弟リスト内を弟方向に1つ移動する
      NextState.moveToNextSibling(targetItemPath)

      NextState.updateItemTimestamp(targetItemPath.itemId)

      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath)
      )

      // キャレット位置、テキスト選択範囲を維持する
      External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
    } else {
      // 弟になるようターゲットアイテムを配置
      NextState.insertNextSiblingItem(firstFollowingItemPath, targetItemPath.itemId)

      // 既存の親子関係を削除
      NextState.removeItemGraphEdge(targetItemPath.parentItemId!!, targetItemPath.itemId)

      NextState.updateItemTimestamp(targetItemPath.itemId)

      // フォーカスを移動先に更新する
      const newTargetItemPath = firstFollowingItemPath.createSiblingItemPath(targetItemPath.itemId)
      assertNonUndefined(newTargetItemPath)
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(newTargetItemPath)
      )

      // キャレット位置、テキスト選択範囲を維持する
      External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
    }
  } else {
    // 1つ下のアイテムが子を表示している場合、最初の子になるよう移動する

    // 最初の子になるようターゲットアイテムを配置
    NextState.insertFirstChildItem(firstFollowingItemPath.itemId, targetItemPath.itemId)

    // 既存の親子関係を削除
    NextState.removeItemGraphEdge(targetItemPath.parentItemId!!, targetItemPath.itemId)

    NextState.updateItemTimestamp(targetItemPath.itemId)

    // フォーカスを移動先に更新する
    const newTargetItemPath = firstFollowingItemPath.createChildItemPath(targetItemPath.itemId)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newTargetItemPath)
    )

    // キャレット位置、テキスト選択範囲を維持する
    External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  }
}

/** アイテムツリー上でEnterキーを押したときのデフォルトの挙動 */
export function enterKeyDefault() {
  const targetItemPath = NextState.getTargetItemPath()

  if (NextState.getItemType(targetItemPath.itemId) === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const selection = getSelection()
    assertNonNull(selection)

    const characterCount = DomishObject.countCharacters(
      NextState.getTextItemDomishObjects(targetItemPath.itemId)
    )
    const textItemSelection = getTextItemSelectionFromDom()
    assertNonUndefined(textItemSelection)

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!targetItemPath.hasParent()) {
      // キャレットより後ろのテキストをカットする
      const range = selection.getRangeAt(0)
      range.setEndAfter(document.activeElement.lastChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      NextState.setTextItemDomishObjects(
        targetItemPath.itemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規アイテムを最初の子として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertFirstChildItem(targetItemPath.itemId, newItemId)
      NextState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.createChildItemPath(newItemId))
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
      return
    }

    if (characterCount === 0) {
      // 空のテキストアイテムなら

      // 新規アイテムを弟として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertNextSiblingItem(targetItemPath, newItemId)

      // キャレット位置を更新する
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.createSiblingItemPath(newItemId)!!)
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
    } else if (textItemSelection.focusDistance < characterCount / 2) {
      // キャレット位置が前半なら

      // キャレットより前のテキストをカットする
      const range = selection.getRangeAt(0)
      range.setStartBefore(document.activeElement.firstChild!)
      const domishObjects = DomishObject.fromChildren(range.extractContents())
      NextState.setTextItemDomishObjects(
        targetItemPath.itemId,
        DomishObject.fromChildren(document.activeElement)
      )

      // 新規アイテムを兄として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertPrevSiblingItem(targetItemPath, newItemId)
      NextState.setTextItemDomishObjects(newItemId, domishObjects)

      // キャレット位置を更新する
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath)
      )
      External.instance.requestSetCaretDistanceAfterRendering(0)
    } else {
      // キャレット位置が後半なら

      if (!NextState.getDisplayingChildItemIds(targetItemPath.itemId).isEmpty()) {
        // もし子を表示しているなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())
        NextState.setTextItemDomishObjects(
          targetItemPath.itemId,
          DomishObject.fromChildren(document.activeElement)
        )

        // 新規アイテムを最初の子として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertFirstChildItem(targetItemPath.itemId, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // キャレット位置を更新する
        External.instance.requestFocusAfterRendering(
          ItemTreeContentView.focusableDomElementId(targetItemPath.createChildItemPath(newItemId))
        )
        External.instance.requestSetCaretDistanceAfterRendering(0)
      } else {
        // もし子を表示していないなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())
        NextState.setTextItemDomishObjects(
          targetItemPath.itemId,
          DomishObject.fromChildren(document.activeElement)
        )

        // 新規アイテムを弟として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertNextSiblingItem(targetItemPath, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // キャレット位置を更新する
        External.instance.requestFocusAfterRendering(
          ItemTreeContentView.focusableDomElementId(
            targetItemPath.createSiblingItemPath(newItemId)!!
          )
        )
        External.instance.requestSetCaretDistanceAfterRendering(0)
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合

    // ターゲットアイテムがアクティブページだった場合は兄弟として追加できないので子として追加する
    if (!targetItemPath.hasParent()) {
      // 新規アイテムを最初の子として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertFirstChildItem(targetItemPath.itemId, newItemId)

      // フォーカスを移す
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.createChildItemPath(newItemId))
      )
      return
    }

    if (!NextState.getDisplayingChildItemIds(targetItemPath.itemId).isEmpty()) {
      // もし子を表示しているなら
      // 新規アイテムを最初の子として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertFirstChildItem(targetItemPath.itemId, newItemId)

      // フォーカスを移す
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.createChildItemPath(newItemId))
      )
    } else {
      // もし子を表示していないなら
      // 新規アイテムを弟として追加する
      const newItemId = NextState.createTextItem()
      NextState.insertNextSiblingItem(targetItemPath, newItemId)

      // フォーカスを移す
      External.instance.requestFocusAfterRendering(
        ItemTreeContentView.focusableDomElementId(targetItemPath.createSiblingItemPath(newItemId)!!)
      )
    }
  }
}

/**
 * アイテムを削除するコマンド。
 * ターゲットアイテムがアクティブページの場合は何もしない。
 */
export function deleteItem() {
  const targetItemPath = NextState.getTargetItemPath()

  // アクティブページを削除しようとしている場合、何もしない
  if (targetItemPath.parent === null) return

  // 上のアイテムをフォーカス
  const aboveItemPath = NextState.findAboveItemPath(targetItemPath)
  assertNonUndefined(aboveItemPath)
  External.instance.requestFocusAfterRendering(
    ItemTreeContentView.focusableDomElementId(aboveItemPath)
  )

  NextState.deleteItem(targetItemPath.itemId)
}

/** contenteditableな要素で改行を実行する */
export function insertLineBreak() {
  document.execCommand('insertLineBreak')
}

/**
 * ターゲットアイテムがページなら非ページ化する。
 * ターゲットアイテムが非ページならページ化する。
 */
export function togglePaged() {
  const targetItemPath = NextState.getTargetItemPath()

  if (NextState.isPage(targetItemPath.itemId)) {
    NextState.becomeNonPage(targetItemPath.itemId)
  } else {
    NextState.becomePage(targetItemPath.itemId)
  }
}

/** 対象アイテムがページなら、そのページに切り替える */
export function showPage() {
  const targetItemPath = NextState.getTargetItemPath()

  if (NextState.isPage(targetItemPath.itemId)) {
    NextState.mountPage(targetItemPath.itemId)
    NextState.setActivePageId(targetItemPath.itemId)
  }
}

/** 対象アイテムをページ化し、そのページに切り替える */
export function becomeAndShowPage() {
  const targetItemPath = NextState.getTargetItemPath()

  NextState.becomePage(targetItemPath.itemId)
  NextState.mountPage(targetItemPath.itemId)
  NextState.setActivePageId(targetItemPath.itemId)
}

/**
 * グレーアウトする。
 * もし既にグレーアウト状態なら非グレーアウト状態に戻す。
 */
export function toggleGrayedOut() {
  const targetItemPath = NextState.getTargetItemPath()

  NextState.toggleCssClass(targetItemPath.itemId, 'grayed-out-item')

  // タイムスタンプを更新
  // TODO: 設定で無効化できるようにする
  NextState.updateItemTimestamp(targetItemPath.itemId)

  // フォーカスを移動する。
  // これは複数のアイテムを連続でグレーアウトする際に有用な挙動である。
  const nextSiblingItemPath = NextState.findFirstFollowingItemPath(targetItemPath)
  if (nextSiblingItemPath !== undefined) {
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(nextSiblingItemPath)
    )
    if (NextState.getItemType(nextSiblingItemPath.itemId) === ItemType.TEXT) {
      External.instance.requestSetCaretDistanceAfterRendering(0)
    }
  }
}
