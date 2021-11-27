import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'

/** 空の画像項目を作る */
export function createImageItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createImageItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作った項目をフォーカスする
  CurrentState.setTargetItemPath(newItemPath)

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
    CurrentState.deleteItem(targetItemId)
  }

  External.instance.dialogState = { type: 'ImageItemEditDialog' }
}

/** 空のコードブロック項目を作る */
export function createCodeBlockItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createCodeBlockItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作った項目をフォーカスする
  CurrentState.setTargetItemPath(newItemPath)

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
    CurrentState.deleteItem(targetItemId)
  }

  External.instance.dialogState = { type: 'CodeBlockItemEditDialog' }
}

/** 空のTeX項目を作る */
export function createTexItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createTexItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作った項目をフォーカスする
  CurrentState.setTargetItemPath(newItemPath)

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
    CurrentState.deleteItem(targetItemId)
  }

  External.instance.dialogState = { type: 'TexItemEditDialog' }
}
