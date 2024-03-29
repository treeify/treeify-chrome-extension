<script lang="ts">
  import { ItemId } from 'src/TreeifyTab/basicType'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import DropdownMenuDialog from 'src/TreeifyTab/View/Dialog/DropdownMenuDialog.svelte'
  import { DropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'
  import { assertNonUndefined } from 'src/Utility/Debug/assert'

  // 「import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode」と書くとなぜかエラーが出るのでその対策
  type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

  function createItemAdditionDropdownMenuDialogProps(): DropdownMenuDialogProps {
    const itemAdditionButton = document.querySelector('.item-addition-button_icon')?.parentElement
    const rect = itemAdditionButton?.getBoundingClientRect()
    assertNonUndefined(rect)

    const itemPropsGroups = [
      [
        {
          title: '画像項目を作成…',
          onClick: () => Command.createImageItem(),
        },
        {
          title: 'コードブロック項目を作成…',
          onClick: () => Command.createCodeBlockItem(),
        },
        {
          title: 'TeX項目を作成…',
          onClick: () => Command.createTexItem(),
        },
      ],
      [
        {
          title: 'ブックマークを全てインポート',
          onClick: async () => {
            Internal.instance.saveCurrentStateToUndoStack()

            const bookmarkTreeNodes = await chrome.bookmarks.getTree()

            const bookmarkRootItemIds = bookmarkTreeNodes
              .flatMap(flattenRedundantRootNode)
              .map(toItem)

            const bookmarkContainerItemId = CurrentState.createTextItem()
            const domishObjects = DomishObject.fromPlainText('ブックマーク')
            CurrentState.setTextItemDomishObjects(bookmarkContainerItemId, domishObjects)
            CurrentState.insertFirstChildItem(
              CurrentState.getActivePageId(),
              bookmarkContainerItemId
            )
            for (const bookmarkRootItemId of bookmarkRootItemIds) {
              CurrentState.insertLastChildItem(bookmarkContainerItemId, bookmarkRootItemId)
            }

            const targetItemPath = [CurrentState.getActivePageId(), bookmarkContainerItemId]
            CurrentState.setTargetItemPath(targetItemPath)
            Rerenderer.instance.requestToFocusTargetItem()
            Rerenderer.instance.rerender()
          },
        },
      ],
    ]
    return {
      top: rect.bottom,
      right: rect.right,
      itemPropsGroups,
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
</script>

<DropdownMenuDialog props={createItemAdditionDropdownMenuDialogProps()} />
