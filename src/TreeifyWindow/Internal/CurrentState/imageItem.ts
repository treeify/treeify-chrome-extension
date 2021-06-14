import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'
import {writable} from 'svelte/store'

/**
 * 新しい空の画像アイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createImageItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: State.Item = {
    itemType: ItemType.IMAGE,
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: writable(List.of()),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.markAsMutated(PropertyPath.of('items', newItemId))

  const imageItem: State.ImageItem = {
    url: writable(''),
    caption: writable(''),
  }
  Internal.instance.state.imageItems[newItemId] = imageItem
  Internal.instance.markAsMutated(PropertyPath.of('imageItems', newItemId))

  return newItemId
}

/** StateのimageItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteImageItemEntry(itemId: ItemId) {
  delete Internal.instance.state.imageItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('imageItems', itemId))
}

/** 画像アイテムのURLを設定する */
export function setImageItemUrl(itemId: ItemId, url: string) {
  Internal.instance.state.imageItems[itemId].url.set(url)
  Internal.instance.markAsMutated(PropertyPath.of('imageItems', itemId, 'url'))
}

/** 画像アイテムのキャプションを設定する */
export function setImageItemCaption(itemId: ItemId, caption: string) {
  Internal.instance.state.imageItems[itemId].caption.set(caption)
  Internal.instance.markAsMutated(PropertyPath.of('imageItems', itemId, 'caption'))
}
