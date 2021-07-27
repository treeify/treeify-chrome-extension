import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Instance} from 'src/TreeifyTab/Instance'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Item, TextItem} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

/** 指定されたテキスト項目のdomishObjectsを更新する */
export function setTextItemDomishObjects(textItemId: ItemId, domishObjects: List<DomishObject>) {
  Internal.instance.searchEngine.updateSearchIndex(textItemId, () => {
    Internal.instance.mutate(
      domishObjects,
      PropertyPath.of('textItems', textItemId, 'domishObjects')
    )
  })
}

/**
 * 新しい空のテキスト項目を作成し、CurrentStateに登録する。
 * ただし項目の配置（親子関係の設定）は行わない。
 */
export function createTextItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.TEXT,
    instanceId: Instance.getId(),
    iisn: Instance.generateIisn(),
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
    cite: null,
    view: {type: 'list'},
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const newTextItem: TextItem = {domishObjects: List.of()}
  Internal.instance.mutate(newTextItem, PropertyPath.of('textItems', newItemId))

  return newItemId
}

/** StateのtextItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteTextItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('textItems', itemId))
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

  if (!item.childItemIds.isEmpty()) return false

  if (CurrentState.countParents(itemId) >= 2) return false

  const domishObjects = Internal.instance.state.textItems[itemId].domishObjects
  return DomishObject.countCharacters(domishObjects) === 0
}
