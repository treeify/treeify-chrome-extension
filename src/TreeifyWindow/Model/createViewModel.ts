import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {assertNeverType} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'
import {Item, State} from 'src/TreeifyWindow/Model/State'
import {ItemTreeContentViewModel} from 'src/TreeifyWindow/View/ItemTreeContentView'
import {ItemTreeNodeViewModel} from 'src/TreeifyWindow/View/ItemTreeNodeView'
import {ItemTreeRootViewModel} from 'src/TreeifyWindow/View/ItemTreeRootView'
import {BulletState, ItemTreeSpoolViewModel} from 'src/TreeifyWindow/View/ItemTreeSpoolView'
import {RootViewModel} from 'src/TreeifyWindow/View/RootView'

export function createRootViewModel(state: State): RootViewModel {
  return {
    itemTreeRootViewModel: createItemTreeRootViewModel(state),
  }
}

function createItemTreeRootViewModel(state: State): ItemTreeRootViewModel {
  const rootItemPath = new ItemPath(List.of(state.activePageId))
  return {
    rootNodeViewModel: createItemTreeNodeViewModel(state, rootItemPath),
  }
}

// 再帰的にアイテムツリーのViewModelを作る
function createItemTreeNodeViewModel(state: State, itemPath: ItemPath): ItemTreeNodeViewModel {
  const item = state.items[itemPath.itemId]
  const visibleChildItemIds = getVisibleChildItemIds(state, itemPath)

  return {
    isActivePage: !itemPath.hasParent(),
    spoolViewModel: createItemTreeSpoolViewModel(state, itemPath, item),
    contentViewModel: createItemTreeContentViewModel(state, itemPath, item.itemType),
    childItemViewModels: visibleChildItemIds.map((childItemId: ItemId) => {
      return createItemTreeNodeViewModel(state, itemPath.createChildItemPath(childItemId))
    }),
  }
}

function getVisibleChildItemIds(state: State, itemPath: ItemPath): List<ItemId> {
  const item = state.items[itemPath.itemId]
  const isPage = state.pages[itemPath.itemId] !== undefined
  if (isPage) {
    return itemPath.hasParent() ? List.of() : item.childItemIds
  }
  return item.isFolded ? List.of() : item.childItemIds
}

function createItemTreeContentViewModel(
  state: State,
  itemPath: ItemPath,
  itemType: ItemType
): ItemTreeContentViewModel {
  // アイテムタイプごとの固有部分を追加して返す
  switch (itemType) {
    case ItemType.TEXT:
      return {
        itemType: ItemType.TEXT,
        domishObjects: state.textItems[itemPath.itemId].domishObjects,
        onInput: (event) => {
          // contenteditableな要素の編集時、Stateに反映する
          if (event.target instanceof Node) {
            const domishObjects = DomishObject.fromChildren(event.target)
            NextState.setTextItemDomishObjects(itemPath.itemId, domishObjects)
            NextState.commit()
          }
        },
        onFocus: (event) => {
          NextState.setActiveItemPath(itemPath)
          NextState.commit()
        },
      }
    case ItemType.WEB_PAGE:
      return {
        itemType: ItemType.WEB_PAGE,
        title: state.webPageItems[itemPath.itemId].tabTitle,
        faviconUrl: state.webPageItems[itemPath.itemId].faviconUrl,
        onFocus: (event) => {
          NextState.setActiveItemPath(itemPath)
          NextState.commit()
        },
      }
    default:
      assertNeverType(itemType)
  }
}

function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath,
  item: Item
): ItemTreeSpoolViewModel {
  const onClick = () => {
    NextState.setActiveItemPath(itemPath)
    NullaryCommand.toggleFolded()
    NextState.commit()
  }
  if (state.pages[item.itemId] !== undefined) {
    return {
      bulletState: BulletState.PAGE,
      onClick,
    }
  } else if (item.childItemIds.size === 0) {
    return {
      bulletState: BulletState.NO_CHILDREN,
      onClick,
    }
  } else {
    return {
      bulletState: item.isFolded ? BulletState.FOLDED : BulletState.UNFOLDED,
      onClick,
    }
  }
}
