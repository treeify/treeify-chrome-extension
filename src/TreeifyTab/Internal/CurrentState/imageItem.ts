import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Instance} from 'src/TreeifyTab/Instance'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {ImageItem, Item} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

/**
 * 新しい空の画像アイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createImageItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    itemType: ItemType.IMAGE,
    instance: Instance.getId(),
    iisn: Instance.generateIisn(),
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
    cite: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const imageItem: ImageItem = {
    url: '',
    heightPx: null,
  }
  Internal.instance.mutate(imageItem, PropertyPath.of('imageItems', newItemId))

  return newItemId
}

/** StateのimageItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteImageItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('imageItems', itemId))
}

/** 画像アイテムのURLを設定する */
export function setImageItemUrl(itemId: ItemId, url: string) {
  Internal.instance.mutate(url, PropertyPath.of('imageItems', itemId, 'url'))
}

/** 画像アイテムのheightPxを設定する */
export function setImageItemHeightPx(itemId: ItemId, heightPx: integer) {
  Internal.instance.mutate(heightPx, PropertyPath.of('imageItems', itemId, 'heightPx'))
}
