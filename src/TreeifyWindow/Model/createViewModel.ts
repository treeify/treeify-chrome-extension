import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {Item, State} from 'src/TreeifyWindow/Model/State'
import {BulletState, ItemTreeBulletViewModel} from 'src/TreeifyWindow/View/ItemTreeBulletView'
import {ItemTreeContentViewModel} from 'src/TreeifyWindow/View/ItemTreeContentView'
import {ItemTreeNodeViewModel} from 'src/TreeifyWindow/View/ItemTreeNodeView'
import {ItemTreeRootViewModel} from 'src/TreeifyWindow/View/ItemTreeRootView'

export function createItemTreeRootViewModel(state: State): ItemTreeRootViewModel {
  const rootItemPath = new ItemPath(List.of(state.activePageId))
  return {
    rootNodeViewModel: createItemTreeNodeViewModel(state, rootItemPath),
  }
}

// 再帰的にアイテムツリーのViewModelを作る
function createItemTreeNodeViewModel(state: State, itemPath: ItemPath): ItemTreeNodeViewModel {
  const item = state.items[itemPath.itemId]
  const visibleChildItemIds: List<ItemId> = item.isFolded ? List.of() : item.childItemIds

  return {
    bulletViewModel: createItemTreeBulletViewModel(item),
    contentViewModel: createItemTreeContentViewModel(state, item),
    childItemViewModels: visibleChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeViewModel(state, itemPath.createChildItemPath(childItemId))
    }),
  }
}

function createItemTreeContentViewModel(state: State, item: Item): ItemTreeContentViewModel {
  // アイテムタイプごとの固有部分を追加して返す
  switch (item.itemType) {
    case ItemType.TEXT:
      return {
        itemType: ItemType.TEXT,
        domishObjects: state.textItems[item.itemId].domishObjects,
      }
    default:
      assertNeverType(item.itemType)
  }
}

function createItemTreeBulletViewModel(item: Item): ItemTreeBulletViewModel {
  if (item.childItemIds.size === 0) return {bulletState: BulletState.NO_CHILDREN}

  return {bulletState: item.isFolded ? BulletState.FOLDED : BulletState.UNFOLDED}
}
