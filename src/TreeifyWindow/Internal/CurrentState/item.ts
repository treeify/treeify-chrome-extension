import {List} from 'immutable'
import {assert, assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'
import {get} from 'svelte/store'

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
    CurrentState.modifyChildItems(parentItemId, (itemIds) =>
      itemIds.remove(itemIds.indexOf(itemId))
    )
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.tabItemCorrespondence.getTabId(itemId)
  if (tabId !== undefined) {
    External.instance.tabItemCorrespondence.untieTabAndItemByTabId(tabId)
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
    CurrentState.modifyChildItems(parentItemId, (itemIds) => {
      const index = itemIds.indexOf(itemId)
      assert(index !== -1)
      return itemIds.splice(index, 1, ...childItemIds)
    })
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.tabItemCorrespondence.getTabId(itemId)
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

/** 指定されたアイテムのタイムスタンプを現在時刻に更新する */
export function updateItemTimestamp(itemId: ItemId) {
  Internal.instance.state.items[itemId].timestamp.set(Timestamp.now())
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'timestamp'))
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
  Internal.instance.state.items[itemId].cssClasses.set(cssClasses)
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'cssClasses'))
}

/**
 * CSSクラスを追加する。
 * 既に追加済みなら削除する。
 */
export function toggleCssClass(itemId: ItemId, cssClass: string) {
  const item = Internal.instance.state.items[itemId]
  const cssClasses = get(item.cssClasses)

  const index = cssClasses.indexOf(cssClass)
  if (index === -1) {
    item.cssClasses.set(cssClasses.push(cssClass))
  } else {
    item.cssClasses.set(cssClasses.remove(index))
  }
  Internal.instance.markAsMutated(PropertyPath.of('items', itemId, 'cssClasses'))
}
