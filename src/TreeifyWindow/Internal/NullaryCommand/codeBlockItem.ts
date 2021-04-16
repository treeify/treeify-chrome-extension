import {assertNonUndefined} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const targetItemPath = CurrentState.getTargetItemPath()

  const newItemId = CurrentState.createCodeBlockItem()

  if (CurrentState.getDisplayingChildItemIds(targetItemPath).isEmpty()) {
    CurrentState.insertNextSiblingItem(targetItemPath, newItemId)

    // 作ったアイテムをフォーカスする
    const newItemPath = ItemPath.createSiblingItemPath(targetItemPath, newItemId)
    assertNonUndefined(newItemPath)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newItemPath)
    )
  } else {
    CurrentState.insertFirstChildItem(ItemPath.getItemId(targetItemPath), newItemId)

    // 作ったアイテムをフォーカスする
    const newItemPath = targetItemPath.push(newItemId)
    External.instance.requestFocusAfterRendering(
      ItemTreeContentView.focusableDomElementId(newItemPath)
    )
  }
}
