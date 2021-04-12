import {List} from 'immutable'
import {assert, assertNeverType, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {createDefaultEdge, Edge} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

/**
 * 指定されたアイテムに関するデータを削除する。
 * 削除によって親の数が0になった子アイテムも再帰的に削除する。
 * キャレットの移動（ターゲットアイテムの変更）は行わない。
 */
export function deleteItem(itemId: ItemId) {
  const item = Internal.instance.state.items[itemId]
  for (const childItemId of item.childItemIds) {
    if (CurrentState.countParents(childItemId) === 1) {
      // 親を1つしか持たない子アイテムは再帰的に削除する
      deleteItem(childItemId)
    } else {
      // 親を2つ以上持つ子アイテムは整合性のために親リストを修正する
      delete Internal.instance.state.items[childItemId].parents[itemId]
    }
  }

  // 削除されるアイテムを親アイテムの子リストから削除する
  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  if (tabId !== undefined) {
    chrome.tabs.remove(tabId)
  }

  // アイテムタイプごとのデータを削除する
  const itemType = item.itemType
  switch (itemType) {
    case ItemType.TEXT:
      CurrentState.deleteTextItemEntry(itemId)
      break
    case ItemType.WEB_PAGE:
      CurrentState.deleteWebPageItemEntry(itemId)
      break
    case ItemType.IMAGE:
      CurrentState.deleteImageItemEntry(itemId)
      break
    case ItemType.CODE_BLOCK:
      CurrentState.deleteCodeBlockItemEntry(itemId)
      break
    default:
      assertNeverType(itemType)
  }

  CurrentState.unmountPage(itemId)
  CurrentState.turnIntoNonPage(itemId)

  CurrentState.deleteItemEntry(itemId)
  CurrentState.recycleItemId(itemId)
}

/**
 * 指定されたアイテムに関するデータを削除する。
 * 子アイテムは親アイテムの子リストに移動する。
 * キャレットの移動（ターゲットアイテムの変更）は行わない。
 */
export function deleteItemItself(itemId: ItemId) {
  const item = Internal.instance.state.items[itemId]
  const childItemIds = item.childItemIds

  // 全ての子アイテムの親リストから自身を削除し、代わりに自身の親リストを挿入する
  for (const childItemId of childItemIds) {
    const parents = Internal.instance.state.items[childItemId].parents
    delete parents[itemId]
    Object.assign(parents, item.parents)
  }

  // 全ての親アイテムの子リストから自身を削除し、代わりに自身の子リストを挿入する
  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    modifyChildItems(parentItemId, (itemIds) => {
      const index = itemIds.indexOf(itemId)
      assert(index !== -1)
      return itemIds.splice(index, 1, ...childItemIds)
    })
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  if (tabId !== undefined) {
    chrome.tabs.remove(tabId)
  }

  // アイテムタイプごとのデータを削除する
  const itemType = item.itemType
  switch (itemType) {
    case ItemType.TEXT:
      CurrentState.deleteTextItemEntry(itemId)
      break
    case ItemType.WEB_PAGE:
      CurrentState.deleteWebPageItemEntry(itemId)
      break
    case ItemType.IMAGE:
      CurrentState.deleteImageItemEntry(itemId)
      break
    case ItemType.CODE_BLOCK:
      CurrentState.deleteCodeBlockItemEntry(itemId)
      break
    default:
      assertNeverType(itemType)
  }

  CurrentState.unmountPage(itemId)
  CurrentState.turnIntoNonPage(itemId)

  CurrentState.deleteItemEntry(itemId)
  CurrentState.recycleItemId(itemId)
}

/** Stateのitemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteItemEntry(itemId: ItemId) {
  delete Internal.instance.state.items[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId))
}

/** 指定されたIDのアイテムが存在するかどうかを調べる */
export function isItem(itemId: ItemId): boolean {
  return undefined !== Internal.instance.state.items[itemId]
}

/** 与えられたアイテムがアイテムツリー上で表示する子アイテムのリストを返す */
export function getDisplayingChildItemIds(itemPath: ItemPath): List<ItemId> {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  // アクティブページはisCollapsedフラグの状態によらず子を強制的に表示する
  if (itemPath.size === 1) {
    return item.childItemIds
  }

  if (CurrentState.getIsCollapsed(itemPath) || CurrentState.isPage(itemId)) {
    return List.of()
  } else {
    return item.childItemIds
  }
}

/** 指定されたアイテムのisCollapsedフラグを設定する */
export function setIsCollapsed(itemPath: ItemPath, isCollapsed: boolean) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  Internal.instance.state.items[itemId].parents[parentItemId].isCollapsed = isCollapsed
  Internal.instance.markAsMutated(
    PropertyPath.of('items', itemId, 'parents', parentItemId, 'isCollapsed')
  )
}

/**
 * 指定されたアイテムのisCollapsedフラグを返す。
 * 親アイテムに依存するのでItemIdではなくItemPathを取る。
 */
export function getIsCollapsed(itemPath: ItemPath): boolean {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  return Internal.instance.state.items[itemId].parents[parentItemId].isCollapsed
}

/** 指定されたアイテムのタイムスタンプを現在時刻に更新する */
export function updateItemTimestamp(itemId: ItemId) {
  Internal.instance.state.items[itemId].timestamp = Timestamp.now()
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'timestamp'))
}

/** 指定されたアイテムの親アイテムIDのリストを返す */
export function getParentItemIds(itemId: ItemId): List<ItemId> {
  return List(Object.keys(Internal.instance.state.items[itemId].parents).map(parseInt))
}

/** 指定されたアイテムの親の数を返す */
export function countParents(itemId: ItemId): integer {
  return Object.keys(Internal.instance.state.items[itemId].parents).length
}

/** 指定されたアイテムに親アイテムを追加する */
export function addParent(itemid: ItemId, parentItemId: ItemId, edge?: Edge) {
  Internal.instance.state.items[itemid].parents[parentItemId] = edge ?? createDefaultEdge()
  Internal.instance.markAsMutated(PropertyPath.of('items', itemid, 'parents', parentItemId))
}

/**
 * 指定されたアイテムの子アイテムリストを修正する。
 * @param itemId このアイテムの子アイテムリストを修正する
 * @param f 子アイテムリストを受け取って新しい子アイテムリストを返す関数
 */
export function modifyChildItems(itemId: ItemId, f: (itemIds: List<ItemId>) => List<ItemId>) {
  const item = Internal.instance.state.items[itemId]
  item.childItemIds = f(item.childItemIds)
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'childItemIds'))
}

/**
 * あるアイテムの最初の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemId このアイテムの最初の子として追加する
 * @param newItemId 最初の子として追加されるアイテム
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertFirstChildItem(itemId: ItemId, newItemId: ItemId, edge?: Edge) {
  // 子リストの先頭に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.unshift(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, itemId, edge)
}

/**
 * あるアイテムの最後の子になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * @param itemId このアイテムの最後の子として追加する
 * @param newItemId 最後の子として追加されるアイテム
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertLastChildItem(itemId: ItemId, newItemId: ItemId, edge?: Edge) {
  // 子リストの末尾に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.push(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, itemId, edge)
}

/**
 * あるアイテムの兄になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で兄として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 兄として追加されるアイテム
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertPrevSiblingItem(itemPath: ItemPath, newItemId: ItemId, edge?: Edge) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (parentItemId === undefined) return

  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemId)) return

  // 兄として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId), newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, parentItemId, edge)
}

/**
 * あるアイテムの弟になるようアイテムを子リストに追加する。
 * 整合性が取れるように親アイテムリストも修正する。
 * 何らかの理由で弟として追加できない場合は何もしない。
 * @param itemPath アイテム追加の基準となるアイテムパス。このアイテムの弟になる
 * @param newItemId 弟として追加されるアイテム
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertNextSiblingItem(itemPath: ItemPath, newItemId: ItemId, edge?: Edge) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない（≒ アクティブページアイテムである）場合は何もしない
  if (parentItemId === undefined) return

  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  // 親の子リストに自身が含まれない場合、すなわち不正なItemPathの場合は何もしない
  if (!childItemIds.contains(itemId)) return

  // 弟として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId) + 1, newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, parentItemId, edge)
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

  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
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

  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
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
 * 戻り値は削除されたエッジオブジェクト。
 */
export function removeItemGraphEdge(parentItemId: ItemId, itemId: ItemId): Edge {
  // 親アイテムの子アイテムリストからアイテムを削除する
  modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))

  const edge = Internal.instance.state.items[itemId].parents[parentItemId]
  // アイテムの親リストから親アイテムを削除する
  delete Internal.instance.state.items[itemId].parents[parentItemId]
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'parents', parentItemId))
  return edge
}

/**
 * 指定されたアイテムを起点とするサブツリーに含まれるアイテムIDを全て返す。
 * ただしページは終端ノードとして扱い、その子孫は無視する。
 */
export function* getSubtreeItemIds(itemId: ItemId): Generator<ItemId> {
  yield itemId

  // ページは終端ノードとして扱う
  if (CurrentState.isPage(itemId)) return

  for (const childItemId of Internal.instance.state.items[itemId].childItemIds) {
    yield* getSubtreeItemIds(childItemId)
  }
}

/** 新しい未使用のアイテムIDを取得・使用開始する */
export function obtainNewItemId(): ItemId {
  const availableItemIds = Internal.instance.state.availableItemIds
  const last = availableItemIds.last(undefined)
  if (last !== undefined) {
    Internal.instance.state.availableItemIds = availableItemIds.pop()
    Internal.instance.markAsMutated(PropertyPath.of('availableItemIds'))
    return last
  } else {
    Internal.instance.markAsMutated(PropertyPath.of('maxItemId'))
    return ++Internal.instance.state.maxItemId
  }
}

/** 使われなくなったアイテムIDを登録する */
export function recycleItemId(itemId: ItemId) {
  const state = Internal.instance.state
  state.availableItemIds = state.availableItemIds.push(itemId)
  Internal.instance.markAsMutated(PropertyPath.of('availableItemIds'))
}

/** 指定されたアイテムのCSSクラスリストを上書き設定する */
export function setCssClasses(itemId: ItemId, cssClasses: List<string>) {
  Internal.instance.state.items[itemId].cssClasses = cssClasses
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'cssClasses'))
}

/**
 * CSSクラスを追加する。
 * 既に追加済みなら削除する。
 */
export function toggleCssClass(itemId: ItemId, cssClass: string) {
  const item = Internal.instance.state.items[itemId]
  const cssClasses = item.cssClasses

  const index = cssClasses.indexOf(cssClass)
  if (index === -1) {
    item.cssClasses = cssClasses.push(cssClass)
  } else {
    item.cssClasses = cssClasses.remove(index)
  }
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'cssClasses'))
}
