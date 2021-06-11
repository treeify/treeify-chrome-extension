import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'
import {writable} from 'svelte/store'

/** 指定されたテキストアイテムのdomishObjectsを更新する */
export function setTextItemDomishObjects(textItemId: ItemId, domishObjects: string) {
  Internal.instance.state.textItems[textItemId].domishObjects.set(domishObjects)
  Internal.instance.markAsMutated(PropertyPath.of('textItems', textItemId, 'domishObjects'))
}

/**
 * 新しい空のテキストアイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createTextItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: State.Item = {
    itemType: ItemType.TEXT,
    childItemIds: writable(List.of()),
    parents: {},
    timestamp: writable(Timestamp.now()),
    cssClasses: writable(List.of()),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.markAsMutated(PropertyPath.of('items', newItemId))

  const newTextItem: State.TextItem = {domishObjects: writable(List.of())}
  Internal.instance.state.textItems[newItemId] = newTextItem
  Internal.instance.markAsMutated(PropertyPath.of('textItems', newItemId))

  return newItemId
}

/** StateのtextItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteTextItemEntry(itemId: ItemId) {
  delete Internal.instance.state.textItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('textItems', itemId))
}
