import {ItemId} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'

/** StateのcodeBlockItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteCodeBlockItemEntry(itemId: ItemId) {
  delete Internal.instance.state.codeBlockItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItems', itemId))
}
