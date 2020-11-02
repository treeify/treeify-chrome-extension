import {NextState} from 'src/TreeifyWindow/Model/NextState'

/** パラメータを持たないコマンドをまとめる名前空間 */
export namespace NullaryCommand {
  /** アクティブアイテムのisFoldedがtrueならfalseに、falseならtrueにするコマンド */
  export function toggleFolded() {
    const activeItemPath = NextState.getActiveItemPath()
    if (activeItemPath === null) return

    const activeItemId = activeItemPath.itemId
    NextState.setItemProperty(activeItemId, 'isFolded', !NextState.getItemIsFolded(activeItemId))
    NextState.updateItemTimestamp(activeItemId)
  }
}
