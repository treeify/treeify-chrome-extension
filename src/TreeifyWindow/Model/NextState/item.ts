import {List} from 'immutable'
import {ItemId} from 'src/Common/basicType'
import {Timestamp} from 'src/Common/Timestamp'
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {getBatchizer} from 'src/TreeifyWindow/Model/NextState/other'
import {Item} from 'src/TreeifyWindow/Model/State'

/** 指定されたアイテムの子アイテムIDリストを返す */
export function getChildItemIds(itemId: ItemId): List<ItemId> {
  return getBatchizer().getDerivedValue(PropertyPath.of('items', itemId, 'childItemIds'))
}

/** 指定されたアイテムの親アイテムIDリストを返す */
export function getParentItemIds(itemId: ItemId): List<ItemId> {
  return getBatchizer().getDerivedValue(PropertyPath.of('items', itemId, 'parentItemIds'))
}

/** 指定されたアイテムのisFoldedフラグを返す */
export function getItemIsFolded(itemId: ItemId): boolean {
  return getBatchizer().getDerivedValue(PropertyPath.of('items', itemId, 'isFolded'))
}

/**
 * 与えられたアイテムの子アイテムのリストを返す。
 * ただしアンフォールド状態の場合は空リストを返す。
 */
export function getDisplayingChildItemIds(itemId: ItemId): List<ItemId> {
  if (getItemIsFolded(itemId)) {
    return List.of()
  } else {
    return getChildItemIds(itemId)
  }
}

/** 指定されたアイテムの特定のプロパティに値を設定する */
export function setItemProperty(itemId: ItemId, propertyName: keyof Item, value: any) {
  getBatchizer().postSetMutation(PropertyPath.of('items', itemId, propertyName), value)
}

/** 指定されたアイテムのタイムスタンプを現在時刻に更新する */
export function updateItemTimestamp(itemId: ItemId) {
  setItemProperty(itemId, 'timestamp', Timestamp.now())
}

/**
 * 指定されたアイテムの子アイテムリストを修正する。
 * @param itemId このアイテムの子アイテムリストを修正する
 * @param f 子アイテムリストを受け取って新しい子アイテムリストを返す関数
 */
export function modifyChildItems(itemId: ItemId, f: (itemIds: List<ItemId>) => List<ItemId>) {
  setItemProperty(itemId, 'childItemIds', f(getChildItemIds(itemId)))
}

/**
 * 指定されたアイテムの親アイテムリストを修正する。
 * @param itemId このアイテムの親アイテムリストを修正する
 * @param f 親アイテムリストを受け取って新しい親アイテムリストを返す関数
 */
export function modifyParentItems(itemId: ItemId, f: (itemIds: List<ItemId>) => List<ItemId>) {
  setItemProperty(itemId, 'parentItemIds', f(getChildItemIds(itemId)))
}

/**
 * あるアイテムの最初の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの最初の子になる
 * @param newItemId 最初の子として追加されるアイテム
 */
export function insertFirstChildItem(itemPath: ItemPath, newItemId: ItemId) {
  // 子リストの先頭に追加する
  modifyChildItems(itemPath.itemId, (itemIds) => itemIds.unshift(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemPath.itemId))
}

/**
 * あるアイテムの最後の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの最後の子になる
 * @param newItemId 最後の子として追加されるアイテム
 */
export function insertLastChildItem(itemPath: ItemPath, newItemId: ItemId) {
  // 子リストの先頭に追加する
  modifyChildItems(itemPath.itemId, (itemIds) => itemIds.push(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemPath.itemId))
}

/**
 * あるアイテムの兄になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で兄として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 兄として追加されるアイテム
 */
export function insertPrevSiblingItem(itemPath: ItemPath, newItemId: ItemId) {
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (itemPath.parentItemId === undefined) return

  const childItemIds = getChildItemIds(itemPath.parentItemId)
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemPath.itemId)) return

  // 兄として追加する
  modifyChildItems(itemPath.parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemPath.itemId), newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemPath.parentItemId!!))
}

/**
 * あるアイテムの弟になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で弟として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 弟として追加されるアイテム
 */
export function insertNextSiblingItem(itemPath: ItemPath, newItemId: ItemId) {
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (itemPath.parentItemId === undefined) return

  const childItemIds = getChildItemIds(itemPath.parentItemId)
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemPath.itemId)) return

  // 弟として追加する
  modifyChildItems(itemPath.parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemPath.itemId) + 1, newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemPath.parentItemId!!))
}

/**
 * 指定されたアイテムを兄弟リスト内で兄方向に1つ移動する。
 * 兄弟リストが定義されない場合は何もしない。
 * 長男だった場合も何もしない。
 */
export function moveToPrevSibling(itemPath: ItemPath) {
  // アクティブページである場合は何もしない
  if (itemPath.parentItemId === undefined) return

  const siblingItemIds = getChildItemIds(itemPath.parentItemId)
  const oldIndex = siblingItemIds.indexOf(itemPath.itemId)
  // 長男だった場合は何もしない
  if (oldIndex === 0) return

  // 子アイテムリスト内で該当アイテムを1つ移動する
  modifyChildItems(itemPath.parentItemId, (itemIds) =>
    itemIds.remove(oldIndex).insert(oldIndex - 1, itemPath.itemId)
  )
}

/**
 * 指定されたアイテムを兄弟リスト内で弟方向に1つ移動する。
 * 兄弟リストが定義されない場合は何もしない。
 * 末弟だった場合も何もしない。
 */
export function moveToNextSibling(itemPath: ItemPath) {
  // アクティブページである場合は何もしない
  if (itemPath.parentItemId === undefined) return

  const siblingItemIds = getChildItemIds(itemPath.parentItemId)
  const oldIndex = siblingItemIds.indexOf(itemPath.itemId)
  // 末弟だった場合は何もしない
  if (oldIndex === siblingItemIds.size - 1) return

  // 子アイテムリスト内で該当アイテムを1つ移動する
  modifyChildItems(itemPath.parentItemId, (itemIds) =>
    itemIds.remove(oldIndex).insert(oldIndex + 1, itemPath.itemId)
  )
}

/**
 * アイテムの親子関係グラフにおけるエッジを削除する。
 * もし親の数が0になったとしてもそのアイテムの削除は行わない。
 * 引数のアイテムが親子関係になかった場合の動作は未定義。
 */
export function removeItemGraphEdge(parentItemId: ItemId, itemId: ItemId) {
  // 親アイテムの子アイテムリストからアイテムを削除する
  modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))

  // アイテムの親リストから親アイテムを削除する
  modifyParentItems(itemId, (itemIds) => itemIds.remove(itemIds.indexOf(parentItemId)))
}
