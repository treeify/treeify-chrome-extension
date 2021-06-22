import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Item, TexItem} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

/**
 * 新しい空のTeXアイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createTexItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    itemType: ItemType.TEX,
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.markAsMutated(PropertyPath.of('items', newItemId))

  const texItem: TexItem = {code: ''}
  Internal.instance.state.texItems[newItemId] = texItem
  Internal.instance.markAsMutated(PropertyPath.of('texItems', newItemId))

  return newItemId
}

/** StateのtexItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteTexItemEntry(itemId: ItemId) {
  delete Internal.instance.state.texItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('texItems', itemId))
}

/** TeXアイテムのコードを設定する */
export function setTexItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.state.texItems[itemId].code = code
  })
  Internal.instance.markAsMutated(PropertyPath.of('texItems', itemId, 'code'))
}
