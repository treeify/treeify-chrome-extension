import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {assert, assertNeverType} from 'src/Common/Debug/assert'
import {Timestamp} from 'src/Common/Timestamp'
import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {getBatchizer} from 'src/TreeifyWindow/Internal/NextState/other'
import {Item} from 'src/TreeifyWindow/Internal/State'
import {External} from 'src/TreeifyWindow/External/External'

/**
 * 指定されたアイテムに関するデータを削除する。
 * 削除によって親の数が0になった子アイテムも再帰的に削除する。
 * キャレットの移動（ターゲットアイテムの変更）は行わない。
 */
export function deleteItem(itemId: ItemId) {
  for (const childItemId of NextState.getChildItemIds(itemId)) {
    if (NextState.getParentItemIds(childItemId).size === 1) {
      // 親を1つしか持たない子アイテムは再帰的に削除する
      deleteItem(childItemId)
    } else {
      // 親を2つ以上持つ子アイテムは整合性のために親リストを修正する
      modifyParentItems(childItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))
    }
  }

  // 削除されるアイテムを親アイテムの子リストから削除する
  for (const parentItemId of NextState.getParentItemIds(itemId)) {
    modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.itemIdToTabId.get(itemId)
  if (tabId !== undefined) {
    chrome.tabs.remove(tabId)
  }

  // アイテムタイプごとのデータを削除する
  const itemType = NextState.getItemType(itemId)
  switch (itemType) {
    case ItemType.TEXT:
      NextState.deleteProperty(PropertyPath.of('textItems', itemId))
      break
    case ItemType.WEB_PAGE:
      NextState.deleteProperty(PropertyPath.of('webPageItems', itemId))
      break
    default:
      assertNeverType(itemType)
  }

  NextState.deleteProperty(PropertyPath.of('items', itemId))
}

/**
 * 指定されたアイテムに関するデータを削除する。
 * 子アイテムは親アイテムの子リストに移動する。
 * キャレットの移動（ターゲットアイテムの変更）は行わない。
 */
export function deleteItemItself(itemId: ItemId) {
  const childItemIds = NextState.getChildItemIds(itemId)
  const parentItemIds = NextState.getParentItemIds(itemId)

  // 全ての子アイテムの親リストから自身を削除し、代わりに自身の親リストを挿入する
  for (const childItemId of childItemIds) {
    modifyParentItems(childItemId, (itemIds) => {
      const index = itemIds.indexOf(itemId)
      assert(index !== -1)
      return itemIds.splice(index, 1, ...childItemIds)
    })
  }

  // 全ての親アイテムの子リストから自身を削除し、代わりに自身の子リストを挿入する
  for (const parentItemId of parentItemIds) {
    modifyChildItems(parentItemId, (itemIds) => {
      const index = itemIds.indexOf(itemId)
      assert(index !== -1)
      return itemIds.splice(index, 1, ...childItemIds)
    })
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.itemIdToTabId.get(itemId)
  if (tabId !== undefined) {
    chrome.tabs.remove(tabId)
  }

  // アイテムタイプごとのデータを削除する
  const itemType = NextState.getItemType(itemId)
  switch (itemType) {
    case ItemType.TEXT:
      NextState.deleteProperty(PropertyPath.of('textItems', itemId))
      break
    case ItemType.WEB_PAGE:
      NextState.deleteProperty(PropertyPath.of('webPageItems', itemId))
      break
    default:
      assertNeverType(itemType)
  }

  NextState.deleteProperty(PropertyPath.of('items', itemId))
}

/** 指定されたIDのアイテムが存在するかどうかを調べる */
export function isItem(itemId: ItemId): boolean {
  return undefined !== getBatchizer().getDerivedValue(PropertyPath.of('items', itemId))
}

/** 指定されたアイテムのアイテムタイプを返す */
export function getItemType(itemId: ItemId): ItemType {
  return getBatchizer().getDerivedValue(PropertyPath.of('items', itemId, 'itemType'))
}

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

/** 与えられたアイテムがアイテムツリー上で表示する子アイテムのリストを返す */
export function getDisplayingChildItemIds(itemId: ItemId): List<ItemId> {
  // アクティブページはisFoldedフラグの状態によらず子を強制的に表示する
  if (NextState.getActivePageId() === itemId) {
    return getChildItemIds(itemId)
  }

  if (getItemIsFolded(itemId) || NextState.isPage(itemId)) {
    return List.of()
  } else {
    return getChildItemIds(itemId)
  }
}

/** 指定されたアイテムの特定のプロパティに値を設定する */
export function setItemProperty(itemId: ItemId, propertyName: keyof Item, value: any) {
  getBatchizer().postSetMutation(PropertyPath.of('items', itemId, propertyName), value)
}

/** 指定されたアイテムのタイムスタンプを返す */
export function getItemTimestamp(itemId: ItemId): Timestamp {
  return getBatchizer().getDerivedValue(PropertyPath.of('items', itemId, 'timestamp'))
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
  setItemProperty(itemId, 'parentItemIds', f(getParentItemIds(itemId)))
}

/**
 * あるアイテムの最初の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemId このアイテムの最初の子として追加する
 * @param newItemId 最初の子として追加されるアイテム
 */
export function insertFirstChildItem(itemId: ItemId, newItemId: ItemId) {
  // 子リストの先頭に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.unshift(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemId))
}

/**
 * あるアイテムの最後の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemId このアイテムの最後の子として追加する
 * @param newItemId 最後の子として追加されるアイテム
 */
export function insertLastChildItem(itemId: ItemId, newItemId: ItemId) {
  // 子リストの先頭に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.push(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(itemId))
}

/**
 * あるアイテムの兄になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で兄として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 兄として追加されるアイテム
 */
export function insertPrevSiblingItem(itemPath: ItemPath, newItemId: ItemId) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (parentItemId === undefined) return

  const childItemIds = getChildItemIds(parentItemId)
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemId)) return

  // 兄として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId), newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(parentItemId!!))
}

/**
 * あるアイテムの弟になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で弟として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 弟として追加されるアイテム
 */
export function insertNextSiblingItem(itemPath: ItemPath, newItemId: ItemId) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (parentItemId === undefined) return

  const childItemIds = getChildItemIds(parentItemId)
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemId)) return

  // 弟として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId) + 1, newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  modifyParentItems(newItemId, (itemIds) => itemIds.push(parentItemId!!))
}

/**
 * 指定されたアイテムを兄弟リスト内で兄方向に1つ移動する。
 * 兄弟リストが定義されない場合は何もしない。
 * 長男だった場合も何もしない。
 */
export function moveToPrevSibling(itemPath: ItemPath) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // アクティブページである場合は何もしない
  if (parentItemId === undefined) return

  const siblingItemIds = getChildItemIds(parentItemId)
  const oldIndex = siblingItemIds.indexOf(itemId)
  // 長男だった場合は何もしない
  if (oldIndex === 0) return

  // 子アイテムリスト内で該当アイテムを1つ移動する
  modifyChildItems(parentItemId, (itemIds) => itemIds.remove(oldIndex).insert(oldIndex - 1, itemId))
}

/**
 * 指定されたアイテムを兄弟リスト内で弟方向に1つ移動する。
 * 兄弟リストが定義されない場合は何もしない。
 * 末弟だった場合も何もしない。
 */
export function moveToNextSibling(itemPath: ItemPath) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // アクティブページである場合は何もしない
  if (parentItemId === undefined) return

  const siblingItemIds = getChildItemIds(parentItemId)
  const oldIndex = siblingItemIds.indexOf(itemId)
  // 末弟だった場合は何もしない
  if (oldIndex === siblingItemIds.size - 1) return

  // 子アイテムリスト内で該当アイテムを1つ移動する
  modifyChildItems(parentItemId, (itemIds) => itemIds.remove(oldIndex).insert(oldIndex + 1, itemId))
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

/**
 * 指定されたアイテムを起点とするサブツリーに含まれるアイテムIDを全て返す。
 * ただしページは終端ノードとして扱い、その子孫は無視する。
 */
export function* getSubtreeItemIds(itemId: ItemId): Generator<ItemId> {
  yield itemId

  // ページは終端ノードとして扱う
  if (NextState.isPage(itemId)) return

  for (const childItemId of NextState.getChildItemIds(itemId)) {
    yield* getSubtreeItemIds(childItemId)
  }
}

/** 次に使うべき新しいアイテムIDを返す */
export function getNextNewItemId(): ItemId {
  return getBatchizer().getDerivedValue(PropertyPath.of('nextNewItemId'))
}

/** 次に使うべき新しいアイテムIDを設定する */
export function setNextNewItemId(itemId: ItemId) {
  getBatchizer().postSetMutation(PropertyPath.of('nextNewItemId'), itemId)
}

/**
 * CSSクラスを追加する。
 * 既に追加済みなら削除する。
 */
export function toggleCssClass(itemId: ItemId, cssClass: string) {
  const propertyPath = PropertyPath.of('items', itemId, 'cssClasses')
  const cssClasses: List<string> = getBatchizer().getDerivedValue(propertyPath)
  const index = cssClasses.indexOf(cssClass)
  if (index === -1) {
    getBatchizer().postSetMutation(propertyPath, cssClasses.push(cssClass))
  } else {
    getBatchizer().postSetMutation(propertyPath, cssClasses.remove(index))
  }
}
