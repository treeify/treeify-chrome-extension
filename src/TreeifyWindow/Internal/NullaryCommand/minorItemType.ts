import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const newItemId = CurrentState.createCodeBlockItem()
  const newItemPath = CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
}

/** 空のTeXアイテムを作る */
export function createEmptyTexItem() {
  const newItemId = CurrentState.createTexItem()
  const newItemPath = CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
}
