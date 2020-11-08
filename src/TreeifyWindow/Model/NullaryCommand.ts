import {ItemType} from 'src/Common/basicType'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {NextState} from 'src/TreeifyWindow/Model/NextState'

/** パラメータを持たないコマンドをまとめる名前空間 */
export namespace NullaryCommand {
  /**
   * この名前空間で定義される全てのコマンド関数をまとめたオブジェクト。
   * コマンド名からコマンド関数を得るために用いる。
   */
  export const functions: {[name: string]: () => void} = {
    toggleFolded,
    indentItem,
    unindentItem,
    moveItemUpward,
    moveItemDownward,
    enterKeyDefault,
    deleteItem,
    insertLineBreak,
    togglePaged,
  }

  /** アクティブアイテムのisFoldedがtrueならfalseに、falseならtrueにするコマンド */
  export function toggleFolded() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    const activeItemId = activeItemPath.itemId
    NextState.setItemProperty(activeItemId, 'isFolded', !NextState.getItemIsFolded(activeItemId))
    NextState.updateItemTimestamp(activeItemId)
  }

  /** アウトライナーのいわゆるインデント操作を実行するコマンド。 */
  export function indentItem() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    const prevSiblingItemPath = NextState.findPrevSiblingItemPath(activeItemPath)
    // 兄が居ない場合、何もしない
    if (prevSiblingItemPath === undefined) return

    // TODO: 兄がページの場合はアンフォールドできないので、何もしないか、兄を非ページ化してから非ページの場合と同じ処理をする必要がある

    // 兄をアンフォールドする
    NextState.setItemProperty(prevSiblingItemPath.itemId, 'isFolded', false)

    // 兄の最後の子になるようアクティブアイテムを配置
    NextState.insertLastChildItem(prevSiblingItemPath, activeItemPath.itemId)

    // 既存の親子関係を削除
    assertNonUndefined(activeItemPath.parentItemId)
    NextState.removeItemGraphEdge(activeItemPath.parentItemId, activeItemPath.itemId)

    NextState.updateItemTimestamp(activeItemPath.itemId)

    // アクティブアイテムパスを移動先に更新する
    NextState.setActiveItemPath(prevSiblingItemPath.createChildItemPath(activeItemPath.itemId))
  }

  /** アウトライナーのいわゆるアンインデント操作を実行するコマンド。 */
  export function unindentItem() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    // 親または親の親が居ない場合は何もしない
    if (activeItemPath.parent === undefined) return
    if (activeItemPath.parent.parent === undefined) return

    // 既存の親子関係を削除
    const activeItemId = activeItemPath.itemId
    NextState.removeItemGraphEdge(activeItemPath.parent.itemId, activeItemId)

    // 親の弟として配置する
    NextState.insertNextSiblingItem(activeItemPath.parent, activeItemId)

    NextState.updateItemTimestamp(activeItemPath.itemId)

    // アクティブアイテムパスを移動先に更新する
    NextState.setActiveItemPath(activeItemPath.parent.createSiblingItemPath(activeItemId)!!)
  }

  /**
   * アイテムをドキュメント順で1つ上に移動するコマンド。
   * 親が居ない場合など、そのような移動ができない場合は何もしない。
   */
  export function moveItemUpward() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    const aboveItemPath = NextState.findAboveItemPath(activeItemPath)
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

    if (aboveItemPath.parentItemId === activeItemPath.parentItemId) {
      // 1つ上のアイテムが兄である場合、兄弟リスト内を兄方向に1つ移動する
      NextState.moveToPrevSibling(activeItemPath)

      NextState.updateItemTimestamp(activeItemPath.itemId)

      // 兄弟リスト内での入れ替えだけならアクティブアイテムパスは変化しないので更新不要
    } else {
      // 1つ上のアイテムの兄になるようアクティブアイテムを配置
      NextState.insertPrevSiblingItem(aboveItemPath, activeItemPath.itemId)

      // 既存の親子関係を削除
      NextState.removeItemGraphEdge(activeItemPath.parentItemId!!, activeItemPath.itemId)

      NextState.updateItemTimestamp(activeItemPath.itemId)

      // アクティブアイテムパスを移動先に更新する
      const newActiveItemPath = aboveItemPath.createSiblingItemPath(activeItemPath.itemId)
      assertNonUndefined(newActiveItemPath)
      NextState.setActiveItemPath(newActiveItemPath)
    }
  }

  /**
   * ドキュメント順でアイテムを1つ下に移動するコマンド。
   * すでに下端の場合など、そのような移動ができない場合は何もしない。
   */
  export function moveItemDownward() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを探索する
    const firstFollowingItemPath = NextState.findFirstFollowingItemPath(activeItemPath)
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

      if (firstFollowingItemPath.parentItemId === activeItemPath.parentItemId) {
        // 兄弟リスト内を弟方向に1つ移動する
        NextState.moveToNextSibling(activeItemPath)

        NextState.updateItemTimestamp(activeItemPath.itemId)

        // 兄弟リスト内での入れ替えだけならアクティブアイテムパスは変化しないので更新不要
      } else {
        // 弟になるようアクティブアイテムを配置
        NextState.insertNextSiblingItem(firstFollowingItemPath, activeItemPath.itemId)

        // 既存の親子関係を削除
        NextState.removeItemGraphEdge(activeItemPath.parentItemId!!, activeItemPath.itemId)

        NextState.updateItemTimestamp(activeItemPath.itemId)

        // アクティブアイテムパスを移動先に更新する
        const newActiveItemPath = firstFollowingItemPath.createSiblingItemPath(
          activeItemPath.itemId
        )
        assertNonUndefined(newActiveItemPath)
        NextState.setActiveItemPath(newActiveItemPath)
      }
    } else {
      // 1つ下のアイテムが子を表示している場合、最初の子になるよう移動する

      // 最初の子になるようアクティブアイテムを配置
      NextState.insertFirstChildItem(firstFollowingItemPath, activeItemPath.itemId)

      // 既存の親子関係を削除
      NextState.removeItemGraphEdge(activeItemPath.parentItemId!!, activeItemPath.itemId)

      NextState.updateItemTimestamp(activeItemPath.itemId)

      // アクティブアイテムパスを移動先に更新する
      const newActiveItemPath = firstFollowingItemPath.createChildItemPath(activeItemPath.itemId)
      NextState.setActiveItemPath(newActiveItemPath)
    }
  }

  /** アイテムツリー上でEnterキーを押したときのデフォルトの挙動 */
  export function enterKeyDefault() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    if (NextState.getItemType(activeItemPath.itemId) === ItemType.TEXT) {
      // アクティブアイテムがテキストアイテムの場合

      assertNonNull(document.activeElement)
      const selection = getSelection()
      assertNonNull(selection)

      // TODO: キャレット位置による分岐を追加する

      if (!NextState.getDisplayingChildItemIds(activeItemPath.itemId).isEmpty()) {
        // もし子を表示しているなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())

        // 新規アイテムを最初の子として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertFirstChildItem(activeItemPath, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // アクティブアイテムを更新する
        NextState.setActiveItemPath(activeItemPath.createChildItemPath(newItemId))
        // TODO: キャレット位置を更新する
      } else {
        // もし子を表示していないなら

        // キャレットより後ろのテキストをカットする
        const range = selection.getRangeAt(0)
        range.setEndAfter(document.activeElement.lastChild!)
        const domishObjects = DomishObject.fromChildren(range.extractContents())

        // 新規アイテムを弟として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertNextSiblingItem(activeItemPath, newItemId)
        NextState.setTextItemDomishObjects(newItemId, domishObjects)

        // アクティブアイテムを更新する
        NextState.setActiveItemPath(activeItemPath.createSiblingItemPath(newItemId)!!)
        // TODO: キャレット位置を更新する
      }
    } else {
      // アクティブアイテムがテキストアイテム以外の場合

      if (!NextState.getDisplayingChildItemIds(activeItemPath.itemId).isEmpty()) {
        // もし子を表示しているなら
        // 新規アイテムを最初の子として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertFirstChildItem(activeItemPath, newItemId)

        // アクティブアイテムを更新する
        NextState.setActiveItemPath(activeItemPath.createChildItemPath(newItemId))
      } else {
        // もし子を表示していないなら
        // 新規アイテムを弟として追加する
        const newItemId = NextState.createTextItem()
        NextState.insertNextSiblingItem(activeItemPath, newItemId)

        // アクティブアイテムを更新する
        NextState.setActiveItemPath(activeItemPath.createSiblingItemPath(newItemId)!!)
      }
    }
  }

  /**
   * アイテムを削除するコマンド。
   * アクティブアイテムがアクティブページの場合は何もしない。
   */
  export function deleteItem() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    // アクティブページを削除しようとしている場合、何もしない
    if (activeItemPath.parent === null) return

    // 新たなアクティブアイテムとして上のアイテムを指定
    const aboveItemPath = NextState.findAboveItemPath(activeItemPath)
    assertNonUndefined(aboveItemPath)
    NextState.setActiveItemPath(aboveItemPath)

    NextState.deleteItem(activeItemPath.itemId)
  }

  /** contenteditableな要素で改行を実行する */
  export function insertLineBreak() {
    document.execCommand('insertLineBreak')
  }

  /**
   * アクティブアイテムがページなら非ページ化する。
   * アクティブアイテムが非ページならページ化する。
   */
  export function togglePaged() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    if (NextState.isPage(activeItemPath.itemId)) {
      NextState.becomeNonPage(activeItemPath.itemId)
    } else {
      NextState.becomePage(activeItemPath.itemId)
    }
  }
}
