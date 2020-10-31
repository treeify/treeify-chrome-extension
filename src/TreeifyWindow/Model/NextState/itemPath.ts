import {Mutation, PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState/index'

/** アクティブアイテムパスを返す */
export function getActiveItemPath(): ItemPath | null {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('activeItemPath'))
}

/** アクティブアイテムパスを上書きする */
export function setActiveItemPath(itemPath: ItemPath | null) {
  NextState.getBatchizer().postMutation(
    PropertyPath.of('activeItemPath'),
    new Mutation.Set(itemPath)
  )
}

/**
 * 1つ上のアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてDの上のアイテムはCであり、Cの上のアイテムはBである。
 *
 * アクティブページには1つ上のアイテムが存在しないのでundefinedを返す。
 *
 * 「上の行のアイテム」と呼びたいところだが、複数行の可能性があるのでその呼び方は避ける。
 */
export function findAboveItemPath(itemPath: ItemPath): ItemPath | undefined {
  // 親が居ない場合（アクティブページの場合）は上のアイテムは存在しない
  if (itemPath.parent === undefined) return undefined

  const prevSiblingItemPath = findPrevSiblingItemPath(itemPath)
  if (prevSiblingItemPath !== undefined) {
    // 兄が居る場合、兄かその子孫のうち最も下に表示されるものが該当アイテムである
    return getLowerEndItemPath(prevSiblingItemPath)
  } else {
    // 兄が居ない場合は親が該当アイテムである
    return itemPath.parent
  }
}

/**
 * 1つ下のアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | | C
 * | D
 * というツリーにおいてBの下のアイテムはCであり、Cの下のアイテムはDである。
 *
 * 該当アイテムが存在しない場合はundefinedを返す。
 *
 * 「下の行のアイテム」と呼びたいところだが、複数行の可能性があるのでその呼び方は避ける。
 */
export function findBelowItemPath(itemPath: ItemPath): ItemPath | undefined {
  const firstChildItemId = NextState.getDisplayingChildItemIds(itemPath.itemId).first(undefined)
  // 表示されているアイテムが存在するなら
  if (firstChildItemId !== undefined) {
    // 最初の子アイテムが該当アイテムである
    return itemPath.createChildItemPath(firstChildItemId)
  }

  // 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムを返す
  return findFirstFollowingItemPath(itemPath)
}

/**
 * 「弟、または親の弟、または親の親の弟、または…」に該当するアイテムパスを探索する。
 * 言い換えると、XPathでいうところのfollowingノードのうち、最も上に表示されるアイテムパスを返す。
 */
export function findFirstFollowingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const nextSiblingItemPath = findNextSiblingItemPath(itemPath)
  // 自身に弟が居る場合は弟を返す
  if (nextSiblingItemPath !== undefined) return nextSiblingItemPath

  // 親が居ない場合（アクティブページに到達した場合）はfollowingアイテムなしなのでundefinedを返す
  if (itemPath.parent === undefined) return undefined

  // 子孫の弟を再帰的に探索する
  return findFirstFollowingItemPath(itemPath.parent)
}

/**
 * 指定されたアイテムパスの兄のアイテムパスを返す。
 * もし兄が存在しないときはundefinedを返す。
 */
export function findPrevSiblingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = itemPath.parent
  if (parentItemPath === undefined) return undefined

  const siblingItemIds = NextState.getChildItemIds(parentItemPath.itemId)

  const index = siblingItemIds.indexOf(itemPath.itemId)
  // 自身が長男の場合
  if (index === 0) return undefined

  return parentItemPath.createChildItemPath(siblingItemIds.get(index - 1)!)
}

/**
 * 指定されたアイテムパスの弟のアイテムパスを返す。
 * もし弟が存在しないときはundefinedを返す。
 */
export function findNextSiblingItemPath(itemPath: ItemPath): ItemPath | undefined {
  const parentItemPath = itemPath.parent
  if (parentItemPath === undefined) return undefined

  const siblingItemIds = NextState.getChildItemIds(parentItemPath.itemId)

  const index = siblingItemIds.indexOf(itemPath.itemId)
  // 自身が末弟の場合
  if (index === siblingItemIds.size - 1) return undefined

  return parentItemPath.createChildItemPath(siblingItemIds.get(index + 1)!)
}

/**
 * 指定されたアイテムまたはその子孫アイテムのうち、最も下に表示されるアイテムのアイテムパスを返す。
 * 例えば
 * A
 * | B
 * | C
 * | | D
 * というツリーではDが該当する。
 */
export function getLowerEndItemPath(itemPath: ItemPath): ItemPath {
  if (NextState.getDisplayingChildItemIds(itemPath.itemId).isEmpty()) {
    // 子を表示していない場合、このアイテムこそが最も下のアイテムである
    return itemPath
  }

  const childItemIds = NextState.getChildItemIds(itemPath.itemId)
  // 末尾の子アイテムに対して再帰呼び出しすることで、最も下に表示されるアイテムを探索する
  return getLowerEndItemPath(itemPath.createChildItemPath(childItemIds.last()))
}
