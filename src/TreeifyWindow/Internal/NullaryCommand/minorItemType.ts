import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createCodeBlockItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキストアイテム上で実行した場合は空のテキストアイテムを削除する
    CurrentState.deleteItem(targetItemId)
  }
}

/** 空のTeXアイテムを作る */
export function createEmptyTexItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createTexItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキストアイテム上で実行した場合は空のテキストアイテムを削除する
    CurrentState.deleteItem(targetItemId)
  }
}
