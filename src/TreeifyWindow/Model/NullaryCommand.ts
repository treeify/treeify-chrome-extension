import {assertNonUndefined} from 'src/Common/Debug/assert'
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
}
