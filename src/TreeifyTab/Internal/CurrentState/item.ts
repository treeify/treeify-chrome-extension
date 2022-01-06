import { List } from 'immutable'
import _ from 'lodash'
import { ItemId, ItemType, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { createDefaultEdge, Edge, Source } from 'src/TreeifyTab/Internal/State'
import { Rist } from 'src/Utility/array'
import { assert, assertNeverType, assertNonUndefined } from 'src/Utility/Debug/assert'
import { integer } from 'src/Utility/integer'
import { Timestamp } from 'src/Utility/Timestamp'

/**
 * 指定された項目に関するデータを削除する。
 * 削除によって親の数が0になった子項目も再帰的に削除する。
 * キャレットの移動（ターゲット項目の変更）は行わない。
 */
export function deleteItem(itemId: ItemId, deleteOnlyItself: boolean = false) {
  assert(itemId !== TOP_ITEM_ID)

  // ダイアログを開いた状態で項目が削除されると、削除済みの項目に対する処理が走って危険なので自動的にダイアログを閉じる
  External.instance.dialogState = undefined

  Internal.instance.searchEngine.deleteSearchIndex(itemId)

  const item = Internal.instance.state.items[itemId]
  if (deleteOnlyItself) {
    // 全ての子項目の親リストから自身を削除し、代わりに自身の親リストを挿入する
    for (const childItemId of item.childItemIds) {
      const parents = Internal.instance.state.items[childItemId].parents
      const edge = parents[itemId]
      Internal.instance.delete(PropertyPath.of('items', childItemId, 'parents', itemId))
      for (const parentsKey in item.parents) {
        Internal.instance.mutate(
          { ...edge },
          PropertyPath.of('items', childItemId, 'parents', parentsKey)
        )
      }
    }

    // 全ての親項目の子リストから自身を削除し、代わりに自身の子リストを挿入する
    for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
      modifyChildItems(parentItemId, (itemIds) => {
        const index = itemIds.indexOf(itemId)
        assert(index !== -1)
        return itemIds.splice(index, 1, ...item.childItemIds)
      })
    }
  } else {
    for (const childItemId of item.childItemIds) {
      if (CurrentState.countParents(childItemId) === 1) {
        // 親を1つしか持たない子項目は再帰的に削除する
        deleteItem(childItemId)
      } else {
        // 親を2つ以上持つ子項目は整合性のために親リストを修正する
        Internal.instance.delete(PropertyPath.of('items', childItemId, 'parents', itemId))
      }
    }

    // 削除される項目を親項目の子リストから削除する
    for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
      modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))
    }
  }

  // 除外リストから削除する
  for (const key in Internal.instance.state.workspaces) {
    const workspace = Internal.instance.state.workspaces[key]
    if (workspace.excludedItemIds.contains(itemId)) {
      Internal.instance.mutate(
        workspace.excludedItemIds.filter((excluded) => excluded !== itemId),
        PropertyPath.of('workspaces', key, 'excludedItemIds')
      )
    }
  }

  // 対応するタブがあれば閉じる
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  if (tabId !== undefined) {
    External.instance.forceCloseTab(tabId)
  }

  // 項目タイプごとのデータを削除する
  const itemType = item.type
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
    case ItemType.TEX:
      CurrentState.deleteTexItemEntry(itemId)
      break
    default:
      assertNeverType(itemType)
  }

  Internal.instance.delete(PropertyPath.of('reminders', itemId))
  CurrentState.setupAllAlarms()

  CurrentState.unmountPage(itemId)
  CurrentState.turnIntoNonPage(itemId)

  CurrentState.deleteItemEntry(itemId)
  CurrentState.recycleItemId(itemId)
}

/** Stateのitemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('items', itemId))
}

/** 指定されたIDの項目が存在するかどうかを調べる */
export function isItem(itemId: ItemId): boolean {
  return undefined !== Internal.instance.state.items[itemId]
}

/** 与えられた項目がメインエリア上で表示する子項目のリストを返す */
export function getDisplayingChildItemIds(itemPath: ItemPath): List<ItemId> {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  // アクティブページはisFoldedフラグの状態によらず子を強制的に表示する
  if (itemPath.size === 1) {
    return item.childItemIds
  }

  if (CurrentState.getIsFolded(itemPath) || CurrentState.isPage(itemId)) {
    return List()
  } else {
    return item.childItemIds
  }
}

/** 指定された項目のisFoldedフラグを設定する */
export function setIsFolded(itemPath: ItemPath, isFolded: boolean) {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  Internal.instance.mutate(
    isFolded,
    PropertyPath.of('items', itemId, 'parents', parentItemId, 'isFolded')
  )
}

/**
 * 指定された項目のisFoldedフラグを返す。
 * 親項目に依存するのでItemIdではなくItemPathを取る。
 */
export function getIsFolded(itemPath: ItemPath): boolean {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  return Internal.instance.state.items[itemId].parents[parentItemId].isFolded
}

/** 指定された項目のタイムスタンプを現在時刻に更新する */
export function updateItemTimestamp(itemId: ItemId) {
  Internal.instance.mutate(Timestamp.now(), PropertyPath.of('items', itemId, 'timestamp'))
}

/** 指定された項目の親項目IDのリストを返す */
export function getParentItemIds(itemId: ItemId): List<ItemId> {
  return List(Object.keys(Internal.instance.state.items[itemId].parents)).map((key) =>
    parseInt(key)
  )
}

/** 指定された項目の親の数を返す */
export function countParents(itemId: ItemId): integer {
  return Object.keys(Internal.instance.state.items[itemId].parents).length
}

/** 指定された項目に親項目を追加する */
export function addParent(itemid: ItemId, parentItemId: ItemId, edge?: Edge) {
  Internal.instance.mutate(
    edge ?? createDefaultEdge(),
    PropertyPath.of('items', itemid, 'parents', parentItemId)
  )
}

/**
 * 指定された項目の子項目リストを修正する。
 * @param itemId この項目の子項目リストを修正する
 * @param f 子項目リストを受け取って新しい子項目リストを返す関数
 */
export function modifyChildItems(itemId: ItemId, f: (itemIds: List<ItemId>) => List<ItemId>) {
  const childItemIds = Internal.instance.state.items[itemId].childItemIds
  Internal.instance.mutate(f(childItemIds), PropertyPath.of('items', itemId, 'childItemIds'))
}

/**
 * ある項目の最初の子になるよう項目を子リストに追加する。
 * 整合性が取れるように親項目リストも修正する。
 * @param itemId この項目の最初の子として追加する
 * @param newItemId 最初の子として追加される項目
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertFirstChildItem(itemId: ItemId, newItemId: ItemId, edge?: Edge) {
  // 子リストの先頭に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.unshift(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, itemId, edge)
}

/**
 * ある項目の最後の子になるよう項目を子リストに追加する。
 * 整合性が取れるように親項目リストも修正する。
 * @param itemId この項目の最後の子として追加する
 * @param newItemId 最後の子として追加される項目
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertLastChildItem(itemId: ItemId, newItemId: ItemId, edge?: Edge) {
  // 子リストの末尾に追加する
  modifyChildItems(itemId, (itemIds) => itemIds.push(newItemId))

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, itemId, edge)
}

/**
 * ある項目の兄になるよう項目を子リストに追加する。
 * 整合性が取れるように親項目リストも修正する。
 * 何らかの理由で兄として追加できない場合は何もしない。
 * @param itemPath 項目追加の基準となるItemPath。この項目の弟になる
 * @param newItemId 兄として追加される項目
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertPrevSiblingItem(
  itemPath: ItemPath,
  newItemId: ItemId,
  edge?: Edge
): ItemPath {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない場合はこの関数を呼んではならない
  assertNonUndefined(parentItemId)

  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  assert(childItemIds.contains(itemId))

  // 兄として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId), newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, parentItemId, edge)

  return ItemPath.createSiblingItemPath(itemPath, newItemId)!
}

/**
 * ある項目の弟になるよう項目を子リストに追加する。
 * 整合性が取れるように親項目リストも修正する。
 * @param itemPath 項目追加の基準となるItemPath。この項目の弟になる
 * @param newItemId 弟として追加される項目
 * @param edge 設定するエッジデータ。指定無しならデフォルトのエッジデータが設定される
 */
export function insertNextSiblingItem(
  itemPath: ItemPath,
  newItemId: ItemId,
  edge?: Edge
): ItemPath {
  const itemId = ItemPath.getItemId(itemPath)
  const parentItemId = ItemPath.getParentItemId(itemPath)
  // 親が居ない場合はこの関数を呼んではならない
  assertNonUndefined(parentItemId)

  const childItemIds = Internal.instance.state.items[parentItemId].childItemIds
  assert(childItemIds.contains(itemId))

  // 弟として追加する
  modifyChildItems(parentItemId, (itemIds) => {
    return itemIds.insert(itemIds.indexOf(itemId) + 1, newItemId)
  })

  // 子リストへの追加に対して整合性が取れるように親リストにも追加する
  CurrentState.addParent(newItemId, parentItemId, edge)

  return ItemPath.createSiblingItemPath(itemPath, newItemId)!
}

/**
 * 指定されたItemPathの（ドキュメント順で）下に項目を配置する。
 * 基本的には弟になるよう配置するが、
 * 指定されたItemPathが子を表示している場合は最初の子になるよう配置する。
 */
export function insertBelowItem(itemPath: ItemPath, newItemId: ItemId, edge?: Edge): ItemPath {
  if (!CurrentState.getDisplayingChildItemIds(itemPath).isEmpty() || itemPath.size === 1) {
    insertFirstChildItem(ItemPath.getItemId(itemPath), newItemId, edge)
    return itemPath.push(newItemId)
  } else {
    return insertNextSiblingItem(itemPath, newItemId, edge)
  }
}

/**
 * 項目の親子関係グラフにおけるエッジを削除する。
 * もし親の数が0になったとしてもその項目の削除は行わない。
 * 引数の項目が親子関係になかった場合の動作は未定義。
 * 戻り値は削除されたエッジオブジェクト。
 */
export function removeItemGraphEdge(parentItemId: ItemId, itemId: ItemId): Edge {
  // 親項目の子項目リストから項目を削除する
  modifyChildItems(parentItemId, (itemIds) => itemIds.remove(itemIds.indexOf(itemId)))

  const edge = Internal.instance.state.items[itemId].parents[parentItemId]
  // 項目の親リストから親項目を削除する
  Internal.instance.delete(PropertyPath.of('items', itemId, 'parents', parentItemId))
  return edge
}

/** 新しい未使用の項目IDを取得・使用開始する */
export function obtainNewItemId(): ItemId {
  const availableItemIds = Internal.instance.state.availableItemIds
  const last = _.last(availableItemIds)
  if (last !== undefined) {
    Internal.instance.mutate(_.initial(availableItemIds), PropertyPath.of('availableItemIds'))
    return last
  } else {
    const maxItemId = Internal.instance.state.maxItemId
    Internal.instance.mutate(maxItemId + 1, PropertyPath.of('maxItemId'))
    return maxItemId + 1
  }
}

/** 使われなくなった項目IDを登録する */
export function recycleItemId(itemId: ItemId) {
  const availableItemIds = Internal.instance.state.availableItemIds
  Internal.instance.mutate(Rist.push(availableItemIds, itemId), PropertyPath.of('availableItemIds'))
}

/** 指定された項目のCSSクラスリストを上書き設定する */
export function setCssClasses(itemId: ItemId, cssClasses: List<string>) {
  Internal.instance.mutate(cssClasses, PropertyPath.of('items', itemId, 'cssClasses'))
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
    Internal.instance.mutate(
      cssClasses.push(cssClass),
      PropertyPath.of('items', itemId, 'cssClasses')
    )
  } else {
    Internal.instance.mutate(
      cssClasses.remove(index),
      PropertyPath.of('items', itemId, 'cssClasses')
    )
  }
}

/**
 * CSSクラスを追加する。
 * 既に追加済みなら何もしない。
 */
export function addCssClass(itemId: ItemId, cssClass: string) {
  const cssClasses = Internal.instance.state.items[itemId].cssClasses
  if (!cssClasses.contains(cssClass)) {
    Internal.instance.mutate(
      cssClasses.push(cssClass),
      PropertyPath.of('items', itemId, 'cssClasses')
    )
  }
}

export function setSource(itemId: ItemId, source: Source) {
  Internal.instance.mutate(source, PropertyPath.of('items', itemId, 'source'))
}
