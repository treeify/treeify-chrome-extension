import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const newItemId = CurrentState.createCodeBlockItem()
  const newItemPath = CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
}
