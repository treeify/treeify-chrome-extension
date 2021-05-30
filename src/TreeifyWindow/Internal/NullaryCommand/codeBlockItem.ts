import {assertNonUndefined} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const targetItemPath = CurrentState.getTargetItemPath()

  const newItemId = CurrentState.createCodeBlockItem()

  if (CurrentState.getDisplayingChildItemIds(targetItemPath).isEmpty()) {
    CurrentState.insertNextSiblingItem(targetItemPath, newItemId)

    // 作ったアイテムをフォーカスする
    const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, newItemId)
    assertNonUndefined(newItemPath)
    CurrentState.setTargetItemPath(newItemPath)
  } else {
    CurrentState.insertFirstChildItem(ItemPath.getItemId(targetItemPath), newItemId)

    // 作ったアイテムをフォーカスする
    const newItemPath = targetItemPath.push(newItemId)
    CurrentState.setTargetItemPath(newItemPath)
  }
}
