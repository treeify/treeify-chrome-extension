import { List } from 'immutable'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Item, TexItem } from 'src/TreeifyTab/Internal/State'
import { Timestamp } from 'src/Utility/Timestamp'

/** 新しい空のTeX項目を作成する。ただし項目の配置（親子関係の設定）は行わない */
export function createTexItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.TEX,
    globalItemId: GlobalItemId.generate(),
    childItemIds: List(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: [],
    source: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const texItem: TexItem = { code: '', caption: '' }
  Internal.instance.mutate(texItem, PropertyPath.of('texItems', newItemId))

  return newItemId
}

/** StateのtexItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteTexItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('texItems', itemId))
}

/** TeX項目のコードを設定する */
export function setTexItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(code, PropertyPath.of('texItems', itemId, 'code'))
  })
}

export function setTexItemCaption(itemId: ItemId, caption: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(caption, PropertyPath.of('texItems', itemId, 'caption'))
  })
}

export function isEmptyTexItem(itemId: ItemId): boolean {
  return Internal.instance.state.texItems[itemId].code.trim() === ''
}
