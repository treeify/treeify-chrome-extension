import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {assertNeverType} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'
import {Item, State, WebPageItem} from 'src/TreeifyWindow/Model/State'
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
    onMouseDownContentArea: (event: MouseEvent) => {
      const inputId = InputId.fromMouseEvent(event)
      if (inputId === '0000MouseButton1') {
        event.preventDefault()
        NextState.setFocusedItemPath(itemPath)
        NullaryCommand.deleteItem()
        NextState.commit()
      }
    },
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
          // もしisComposingがtrueの時にModelに反映するとテキストが重複してしまう
          if (!event.isComposing && event.target instanceof Node) {
            // contenteditableな要素のinnerHTMLをModelに反映する
            const domishObjects = DomishObject.fromChildren(event.target)
            NextState.setTextItemDomishObjects(itemPath.itemId, domishObjects)
            NextState.commit()
          }
        },
        onCompositionEnd: (event) => {
          if (event.target instanceof Node) {
            // contenteditableな要素のinnerHTMLをModelに反映する
            const domishObjects = DomishObject.fromChildren(event.target)
            NextState.setTextItemDomishObjects(itemPath.itemId, domishObjects)
            NextState.commit()
          }
        },
        onFocus: (event) => {
          NextState.setFocusedItemPath(itemPath)
          NextState.commitSilently()
        },
      }
    case ItemType.WEB_PAGE:
      const webPageItem = state.webPageItems[itemPath.itemId]
      return {
        itemType: ItemType.WEB_PAGE,
        title: webPageItemTitle(webPageItem),
        faviconUrl: webPageItem.faviconUrl,
        onFocus: (event) => {
          NextState.setFocusedItemPath(itemPath)
          NextState.commit()
        },
      }
    default:
      assertNeverType(itemType)
  }
}

// 正規表現で置換されたタイトルを返す。
// 正規表現にエラーがあった場合はタブのタイトルを返す。
function webPageItemTitle(webPageItem: WebPageItem): string {
  try {
    const regExp = new RegExp(webPageItem.titleReplaceInputPattern)
    return webPageItem.tabTitle.replace(regExp, webPageItem.titleReplaceOutputPattern)
  } catch {
    return webPageItem.tabTitle
  }
}

function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath,
  item: Item
): ItemTreeSpoolViewModel {
  const onClick = () => {
    if (NextState.isPage(itemPath.itemId)) {
      // ページアイコンのクリック時はアクティブページを切り替える
      NextState.setActivePageId(itemPath.itemId)
      NextState.commit()
    } else {
      NextState.setFocusedItemPath(itemPath)
      NullaryCommand.toggleFolded()
      NextState.commit()
    }
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
