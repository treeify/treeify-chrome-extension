import { List } from 'immutable'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { ImageItem, Item, SizePx } from 'src/TreeifyTab/Internal/State'
import { integer } from 'src/Utility/integer'
import { Timestamp } from 'src/Utility/Timestamp'

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
    source: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const imageItem: ImageItem = {
    url: '',
    caption: '',
    originalSize: null,
    widthPx: null,
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

export function setImageItemOriginalSize(itemId: ItemId, originalSize: SizePx | null) {
  Internal.instance.mutate(originalSize, PropertyPath.of('imageItems', itemId, 'originalSize'))
}

export function setImageItemWidthPx(itemId: ItemId, widthPx: integer) {
  Internal.instance.mutate(widthPx, PropertyPath.of('imageItems', itemId, 'widthPx'))
}

export function isEmptyImageItem(itemId: ItemId): boolean {
  return Internal.instance.state.imageItems[itemId].url.trim() === ''
}
