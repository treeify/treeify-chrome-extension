import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'

/** Treeifyの状態全体を表すオブジェクトの型 */
export type State = {
  // キーの型はItemIdと書きたいが、TypeScriptの仕様上numberとしか書けない
  items: {[index: number]: Item}
  textItems: {[index: number]: TextItem}
  nextNewItemId: ItemId
  activePageId: ItemId
  activeItemPath: ItemPath | null
}

/**
 * 全てのアイテムが共通で持つデータの型。
 * つまり、ItemTypeによらず各アイテムが必ず持っているデータ。
 */
export type Item = {
  itemId: ItemId
  itemType: ItemType
  childItemIds: List<ItemId>
  parentItemIds: List<ItemId>
  isFolded: boolean
}

/** テキストアイテムが固有で持つデータの型 */
export type TextItem = {
  itemId: ItemId
  domishObjects: List<DomishObject>
}
