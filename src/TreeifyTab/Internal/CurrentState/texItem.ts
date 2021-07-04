import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Item, TexItem} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

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
    cite: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const texItem: TexItem = {code: ''}
  Internal.instance.mutate(texItem, PropertyPath.of('texItems', newItemId))

  return newItemId
}

/** StateのtexItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteTexItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('texItems', itemId))
}

/** TeXアイテムのコードを設定する */
export function setTexItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(code, PropertyPath.of('texItems', itemId, 'code'))
  })
}
