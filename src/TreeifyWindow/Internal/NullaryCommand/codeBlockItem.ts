import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Derived} from 'src/TreeifyWindow/Internal/Derived'
import {get} from 'src/TreeifyWindow/svelte'

/** 空のコードブロックアイテムを作る */
export function createEmptyCodeBlockItem() {
  const newItemId = CurrentState.createCodeBlockItem()
  const newItemPath = CurrentState.insertBelowItem(get(Derived.getTargetItemPath()), newItemId)
  // 作ったアイテムをフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
}
