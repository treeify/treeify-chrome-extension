<script lang="ts" context="module">
  import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode
</script>

<script lang="ts">
  import {List} from 'immutable'
  import {ItemId} from '../../basicType'
  import {doAsyncWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {DomishObject} from '../../Internal/DomishObject'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      const bookmarkTreeNodes = await chrome.bookmarks.getTree()
      const bookmarkRootItemIds = bookmarkTreeNodes.flatMap(flattenRedundantRootNode).map(toItem)

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
    })
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

<ToolbarIconButton on:click={onClick}>
  <div class="import-button_icon" />
</ToolbarIconButton>

<style global>
  :root {
    /* インポートボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --import-button-icon-size: 22px;
  }

  .import-button_icon {
    width: var(--import-button-icon-size);
    height: var(--import-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('import-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
