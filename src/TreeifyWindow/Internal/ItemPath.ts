import {is, List} from 'immutable'
import {ItemId} from 'src/Common/basicType'
import {assert, assertNonUndefined} from 'src/Common/Debug/assert'

/** アイテムの親子関係がなす有向グラフにおけるパス */
export class ItemPath {
  /** Listの先頭要素がパスの始点、末尾要素が終点として扱われる */
  constructor(readonly itemIds: List<ItemId>) {
    assert(itemIds.size > 0)
  }

  /** パスの始点アイテムのIDを返す */
  get rootItemId(): ItemId {
    const itemId = this.itemIds.first(undefined)
    assertNonUndefined(itemId)
    return itemId
  }

  /** パスの終点アイテムのIDを返す */
  get itemId(): ItemId {
    const last = this.itemIds.last(undefined)
    assertNonUndefined(last)
    return last
  }

  /** パスの終点より1つ前のアイテムのIDを返す */
  get parentItemId(): ItemId | undefined {
    if (!this.hasParent()) {
      return undefined
    }
    return this.itemIds.get(this.itemIds.size - 2) as ItemId
  }

  hasParent(): boolean {
    return this.itemIds.size >= 2
  }

  /**
   * 親ItemPathを返す。
   * もし無い場合はundefinedを返す。
   */
  get parent(): ItemPath | undefined {
    if (this.hasParent()) {
      return new ItemPath(this.itemIds.pop())
    } else {
      return undefined
    }
  }

  /** このItemPathの末尾にItemIdを追加することで新しいItemPathを作成する */
  createChildItemPath(childItemId: ItemId): ItemPath {
    return new ItemPath(this.itemIds.push(childItemId))
  }

  /** このItemPathの末尾のItemIdを置き換えることで新しいItemPathを作成する */
  createSiblingItemPath(siblingItemId: ItemId): ItemPath | undefined {
    return this.parent?.createChildItemPath(siblingItemId)
  }

  /** 2つのItemPathが同一内容かどうかを判定する */
  equals(other: ItemPath): boolean {
    return is(this.itemIds, other.itemIds)
  }

  /** デバッグ用のtoStringオーバーライド */
  toString(): string {
    return `[${this.itemIds.join(', ')}]`
  }
}
