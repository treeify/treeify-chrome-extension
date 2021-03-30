import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {Timestamp} from 'src/Common/Timestamp'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Item, TextItem} from 'src/TreeifyWindow/Internal/State'

/** 指定されたテキストアイテムのdomishObjectsを更新する */
export function setTextItemDomishObjects(textItemId: ItemId, domishObjects: List<DomishObject>) {
  Internal.instance.state.textItems[textItemId].domishObjects = domishObjects
  Internal.instance.markAsMutated(PropertyPath.of('textItems', textItemId, 'domishObjects'))
}

/**
 * 新しい空のテキストアイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createTextItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    itemId: newItemId,
    itemType: ItemType.TEXT,
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.markAsMutated(PropertyPath.of('items', newItemId))

  const newTextItem: TextItem = {domishObjects: List.of()}
  Internal.instance.state.textItems[newItemId] = newTextItem
  Internal.instance.markAsMutated(PropertyPath.of('textItems', newItemId))

  return newItemId
}

/** StateのtextItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteTextItemEntry(itemId: ItemId) {
  delete Internal.instance.state.textItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('textItems', itemId))
}
