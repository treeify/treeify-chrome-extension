import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {GlobalItemId} from 'src/TreeifyTab/Instance'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {ImageItem, Item} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

/**
 * 新しい空の画像項目を作成し、CurrentStateに登録する。
 * ただし項目の配置（親子関係の設定）は行わない。
 */
export function createImageItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.IMAGE,
    globalItemId: GlobalItemId.generate(),
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
    cite: null,
    view: {type: 'list'},
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const imageItem: ImageItem = {
    url: '',
    caption: '',
    heightPx: null,
  }
  Internal.instance.mutate(imageItem, PropertyPath.of('imageItems', newItemId))

  return newItemId
}

/** StateのimageItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteImageItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('imageItems', itemId))
}

/** 画像項目のURLを設定する */
export function setImageItemUrl(itemId: ItemId, url: string) {
  Internal.instance.mutate(url, PropertyPath.of('imageItems', itemId, 'url'))
}

/** 画像アイテムのキャプションを設定する */
export function setImageItemCaption(itemId: ItemId, caption: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(caption, PropertyPath.of('imageItems', itemId, 'caption'))
  })
}

/** 画像項目のheightPxを設定する */
export function setImageItemHeightPx(itemId: ItemId, heightPx: integer) {
  Internal.instance.mutate(heightPx, PropertyPath.of('imageItems', itemId, 'heightPx'))
}

export function isEmptyImageItem(itemId: ItemId): boolean {
  return Internal.instance.state.imageItems[itemId].url.trim() === ''
}
