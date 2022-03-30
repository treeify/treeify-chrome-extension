import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { Item, TextItem } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { RArray } from 'src/Utility/fp-ts'
import { Timestamp } from 'src/Utility/Timestamp'

/** 指定されたテキスト項目のdomishObjectsを更新する */
export function setTextItemDomishObjects(textItemId: ItemId, domishObjects: RArray<DomishObject>) {
  Internal.instance.searchEngine.updateSearchIndex(textItemId, () => {
    Internal.instance.mutate(domishObjects, StatePath.of('textItems', textItemId, 'domishObjects'))
  })
}

/** 新しい空のテキスト項目を作成する。ただし項目の配置（親子関係の設定）は行わない */
export function createTextItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.TEXT,
    globalItemId: GlobalItemId.generate(),
    childItemIds: [],
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: [],
    source: null,
  }
  Internal.instance.mutate(newItem, StatePath.of('items', newItemId))

  const newTextItem: TextItem = { domishObjects: [] }
  Internal.instance.mutate(newTextItem, StatePath.of('textItems', newItemId))

  return newItemId
}

/** StateのtextItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteTextItemEntry(itemId: ItemId) {
  Internal.instance.delete(StatePath.of('textItems', itemId))
}

/**
 * 与えられた項目が下記の条件をすべて満たすかどうかを判定する。
 * ・空のテキスト項目である
 * ・子を持たない
 * ・親を複数持たない
 */
export function isEmptyTextItem(itemId: ItemId): boolean {
  const item = Internal.instance.state.items[itemId]
  if (item.type !== ItemType.TEXT) return false

  if (item.childItemIds.length > 0) return false

  if (CurrentState.countParents(itemId) >= 2) return false

  const domishObjects = Internal.instance.state.textItems[itemId].domishObjects
  return DomishObject.getTextLength(domishObjects) === 0
}
