import {ItemId} from 'src/Common/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'

/** StateのimageItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteImageItemEntry(itemId: ItemId) {
  delete Internal.instance.state.imageItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('imageItems', itemId))
}
