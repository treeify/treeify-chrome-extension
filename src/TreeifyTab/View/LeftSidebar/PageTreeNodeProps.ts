import { pipe } from 'fp-ts/function'
import { ItemId, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import {
  createPageTreeBulletAndIndentProps,
  PageTreeBulletAndIndentProps,
} from 'src/TreeifyTab/View/LeftSidebar/PageTreeBulletAndIndentProps'
import { CssCustomProperty, TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { NERArray$, RArray, RArray$, RSet, RSet$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type PageTreeNodeProps = {
  itemId: ItemId
  bulletAndIndentProps: PageTreeBulletAndIndentProps
  contentProps: ItemContentProps
  childNodePropses: RArray<PageTreeNodeProps>
  isActivePage: boolean
  isRoot: boolean
  isAudible: boolean
  footprintRank: integer | undefined
  footprintCount: integer
  tabsCount: integer
  onClickContentArea(event: MouseEvent): void
  onContentAreaContextMenu(event: Event): void
  onClickCloseButton(event: Event): void
  onClickTabsCount(event: MouseEvent): void
  onTabsCountContextMenu(event: Event): void
}

export function createPageTreeRootNodeProps(state: State): PageTreeNodeProps {
  const filteredPageIds = CurrentState.getFilteredMountedPageIds()

  const tree = CurrentState.treeify(RSet$.from(filteredPageIds), TOP_ITEM_ID, true)
  return tree.fold((itemPath, children) => {
    const itemId = ItemPath.getItemId(itemPath)
    const activePageId = CurrentState.getActivePageId()

    const nonActivePageIds = filteredPageIds.filter((itemId) => activePageId !== itemId)
    const exponent = CssCustomProperty.getNumber('--page-tree-footprint-count-exponent') ?? 0.6
    const footprintCount = Math.floor(nonActivePageIds.length ** exponent)
    const index = nonActivePageIds.indexOf(itemId)
    const rank = index !== -1 ? nonActivePageIds.length - index - 1 : 0

    return {
      itemId,
      bulletAndIndentProps: createPageTreeBulletAndIndentProps(
        countSubtreeNodes(children) - 1,
        itemPath
      ),
      contentProps: createItemContentProps(itemId),
      childNodePropses:
        ItemPath.hasParent(itemPath) && CurrentState.getIsFolded(itemPath) ? [] : children,
      isActivePage: activePageId === itemId,
      isRoot: itemId === TOP_ITEM_ID,
      isAudible: getAudiblePageIds().has(itemId),
      footprintRank: rank < footprintCount ? rank : undefined,
      footprintCount,
      tabsCount: CurrentState.countTabsInSubtree(state, itemId),
      onClickContentArea(event: MouseEvent) {
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()
            CurrentState.switchActivePage(itemId)
            Rerenderer.instance.requestToFocusTargetItem()
            Rerenderer.instance.rerender()
            break
          case '0000MouseButton1':
            event.preventDefault()
            if (itemId === TOP_ITEM_ID) break

            // ページ全体のタブを閉じる
            for (const subtreeItemId of CurrentState.yieldSubtreeItemIdsShallowly(itemId)) {
              const tabId = External.instance.tabItemCorrespondence.getTabId(subtreeItemId)
              if (tabId !== undefined) {
                // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
                External.instance.tabIdsToBeClosedForUnloading.add(tabId)

                // 対応するタブを閉じる
                External.instance.forceCloseTab(tabId)
              }
            }
            unmountPage(itemId, activePageId)
            break
          case '0100MouseButton1':
            event.preventDefault()
            if (itemId === TOP_ITEM_ID) break

            unmountPage(itemId, activePageId)
            break
        }
      },
      onContentAreaContextMenu(event: Event) {
        event.preventDefault()

        if (event instanceof MouseEvent) {
          CurrentState.switchActivePage(itemId)
          CurrentState.setTargetItemPath([itemId])

          // 独自コンテキストメニューを表示
          External.instance.dialogState = {
            type: 'ContextMenu',
            mousePosition: { x: event.clientX, y: event.clientY },
          }
          Rerenderer.instance.rerender()
        }
      },
      onClickCloseButton(event) {
        event.preventDefault()
        unmountPage(itemId, activePageId)
      },
      onClickTabsCount(event) {
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()
            // ページ全体のタブを閉じる
            for (const subtreeItemId of CurrentState.yieldSubtreeItemIdsShallowly(itemId)) {
              const tabId = External.instance.tabItemCorrespondence.getTabId(subtreeItemId)
              if (tabId !== undefined) {
                // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
                External.instance.tabIdsToBeClosedForUnloading.add(tabId)

                // 対応するタブを閉じる
                chrome.tabs.remove(tabId)
              }
            }
            break
          case '0100MouseButton0':
            event.preventDefault()
            if (itemId === TOP_ITEM_ID) break

            unmountPage(itemId, activePageId)
            break
        }
      },
      onTabsCountContextMenu(event: Event) {
        event.preventDefault()

        External.instance.dialogState = { type: 'TabsDialog', targetItem: itemId }
        Rerenderer.instance.rerender()
      },
    }
  })
}

function countSubtreeNodes(children: RArray<PageTreeNodeProps>): integer {
  return (
    1 +
    pipe(
      children,
      RArray$.map((child: PageTreeNodeProps) => countSubtreeNodes(child.childNodePropses)),
      RArray$.sum
    )
  )
}

function getAudiblePageIds(): RSet<ItemId> {
  const audibleTabIds = External.instance.tabItemCorrespondence.getAllAudibleTabIds()
  const audibleItemIds = pipe(
    audibleTabIds,
    RArray$.map((tabId: TabId) => External.instance.tabItemCorrespondence.getItemId(tabId)),
    RArray$.filterUndefined,
    RSet$.from
  )
  return RSet$.flatMap(CurrentState.getPageIdsBelongingTo)(audibleItemIds)
}

function unmountPage(itemId: number, activePageId: number) {
  if (itemId === TOP_ITEM_ID) return

  Internal.instance.saveCurrentStateToUndoStack()
  CurrentState.unmountPage(itemId)

  // もしアクティブページなら、最も新しいページを新たなアクティブページとする
  if (itemId === activePageId) {
    const lastPageId = NERArray$.last(CurrentState.getFilteredMountedPageIds())
    assertNonUndefined(lastPageId)
    CurrentState.switchActivePage(lastPageId)
    Rerenderer.instance.requestToFocusTargetItem()
  }

  Rerenderer.instance.rerender()
}
