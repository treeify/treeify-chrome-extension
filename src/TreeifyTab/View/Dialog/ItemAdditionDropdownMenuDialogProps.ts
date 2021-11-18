import { List } from 'immutable'
import { assertNonUndefined } from 'src/Common/Debug/assert'
import { ItemId } from 'src/TreeifyTab/basicType'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { DropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

export function createItemAdditionDropdownMenuDialogProps(): DropdownMenuDialogProps {
  const itemAdditionButton = document.querySelector('.item-addition-button_icon')?.parentElement
  const rect = itemAdditionButton?.getBoundingClientRect()
  assertNonUndefined(rect)

  return {
    top: rect.bottom,
    right: rect.right,
    itemPropses: List.of(
      {
        title: '画像項目を作成…',
        onClick: () => Command.createEmptyImageItem(),
      },
      {
        title: 'コードブロック項目を作成…',
        onClick: () => Command.createEmptyCodeBlockItem(),
      },
      {
        title: 'TeX項目を作成…',
        onClick: () => Command.createEmptyTexItem(),
      },
      {
        title: 'ブックマークを全てインポート',
        onClick: async () => {
          const bookmarkTreeNodes = await chrome.bookmarks.getTree()
          const bookmarkRootItemIds = bookmarkTreeNodes
            .flatMap(flattenRedundantRootNode)
            .map(toItem)

          const bookmarkContainerItemId = CurrentState.createTextItem()
          const domishObjects = DomishObject.fromPlainText('ブックマーク')
          CurrentState.setTextItemDomishObjects(bookmarkContainerItemId, domishObjects)
          CurrentState.insertFirstChildItem(CurrentState.getActivePageId(), bookmarkContainerItemId)
          for (const bookmarkRootItemId of bookmarkRootItemIds) {
            CurrentState.insertLastChildItem(bookmarkContainerItemId, bookmarkRootItemId)
          }

          const targetItemPath = List.of(CurrentState.getActivePageId(), bookmarkContainerItemId)
          CurrentState.setTargetItemPath(targetItemPath)

          Rerenderer.instance.rerender()
        },
      }
    ),
  }
}

// chrome.bookmarks.getTree()が冗長な空のルートノードを返してくるのでその対策
function flattenRedundantRootNode(bookmarkTreeNode: BookmarkTreeNode): BookmarkTreeNode[] {
  if (bookmarkTreeNode.children === undefined) return [bookmarkTreeNode]

  if (bookmarkTreeNode.title !== '') return [bookmarkTreeNode]
  if (bookmarkTreeNode.url !== undefined) return [bookmarkTreeNode]

  return bookmarkTreeNode.children
}

function toItem(bookmarkTreeNode: BookmarkTreeNode): ItemId {
  if (bookmarkTreeNode.url === undefined) {
    const itemId = CurrentState.createTextItem()
    const domishObjects = DomishObject.fromPlainText(bookmarkTreeNode.title)
    CurrentState.setTextItemDomishObjects(itemId, domishObjects)

    if (bookmarkTreeNode.children !== undefined) {
      for (const childItemId of bookmarkTreeNode.children.map(toItem)) {
        CurrentState.insertLastChildItem(itemId, childItemId)
      }
    }

    return itemId
  } else {
    const itemId = CurrentState.createWebPageItem()
    CurrentState.setWebPageItemUrl(itemId, bookmarkTreeNode.url)
    CurrentState.setWebPageItemTitle(itemId, bookmarkTreeNode.title)
    const url = new URL(bookmarkTreeNode.url)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}`
    CurrentState.setWebPageItemFaviconUrl(itemId, faviconUrl)

    if (bookmarkTreeNode.children !== undefined) {
      for (const childItemId of bookmarkTreeNode.children.map(toItem)) {
        CurrentState.insertLastChildItem(itemId, childItemId)
      }
    }

    return itemId
  }
}
