import {List, Set} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyTab/basicType'
import {CssCustomProperty} from 'src/TreeifyTab/CssCustomProperty'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import {
  createPageTreeBulletAndIndentProps,
  PageTreeBulletAndIndentProps,
} from 'src/TreeifyTab/View/LeftSidebar/PageTreeBulletAndIndentProps'

export type PageTreeNodeProps = {
  itemId: ItemId
  bulletAndIndentProps: PageTreeBulletAndIndentProps
  contentProps: ItemContentProps
  childNodePropses: List<PageTreeNodeProps>
  isActivePage: boolean
  isRoot: boolean
  isAudible: boolean
  footprintRank: integer | undefined
  footprintCount: integer
  tabsCount: integer
  onClickContentArea: (event: MouseEvent) => void
  onClickCloseButton: () => void
  onClickTabsCount: (event: MouseEvent) => void
  onTabsCountContextMenu: (event: Event) => void
}

export function createPageTreeRootNodeProps(state: State): PageTreeNodeProps {
  const filteredPageIds = CurrentState.getFilteredMountedPageIds()

  const tree = CurrentState.treeify(CurrentState.getFilteredMountedPageIds().toSet(), TOP_ITEM_ID)
  return tree.fold((itemPath, children) => {
    const itemId = ItemPath.getItemId(itemPath)
    const activePageId = CurrentState.getActivePageId()

    const nonActivePageIds = filteredPageIds.filter((itemId) => activePageId !== itemId)
    const exponent = CssCustomProperty.getNumber('--page-tree-footprint-count-exponent') ?? 0.7
    const footprintCount = Math.floor(nonActivePageIds.size ** exponent)
    const index = nonActivePageIds.indexOf(itemId)
    const rank = index !== -1 ? nonActivePageIds.size - index - 1 : 0

    return {
      itemId,
      bulletAndIndentProps: createPageTreeBulletAndIndentProps(children.length > 0, itemPath),
      contentProps: createItemContentProps(itemId),
      childNodePropses: List(children),
      isActivePage: activePageId === itemId,
      isRoot: itemId === TOP_ITEM_ID,
      isAudible: getAudiblePageIds().contains(itemId),
      footprintRank: rank < footprintCount ? rank : undefined,
      footprintCount,
      tabsCount: CurrentState.countLoadedTabsInSubtree(state, itemId),
      onClickContentArea: (event: MouseEvent) => {
        doWithErrorCapture(() => {
          switch (InputId.fromMouseEvent(event)) {
            case '0000MouseButton0':
              event.preventDefault()
              CurrentState.switchActivePage(itemId)
              Rerenderer.instance.rerender()
              break
            case '0000MouseButton1':
              event.preventDefault()
              if (itemId === TOP_ITEM_ID) break

              // ページ全体をハードアンロードする
              for (const subtreeItemId of CurrentState.getSubtreeItemIds(itemId)) {
                const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
                if (tabId !== undefined) {
                  // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
                  External.instance.tabIdsToBeClosedForUnloading.add(tabId)

                  // 対応するタブを閉じる
                  chrome.tabs.remove(tabId)
                }
              }
              unmountPage(itemId, activePageId)
              break
          }
        })
      },
      onClickCloseButton: () => {
        doWithErrorCapture(() => {
          unmountPage(itemId, activePageId)
        })
      },
      onClickTabsCount: (event) => {
        doWithErrorCapture(() => {
          switch (InputId.fromMouseEvent(event)) {
            case '0000MouseButton0':
              // ページ全体をハードアンロードする
              for (const subtreeItemId of CurrentState.getSubtreeItemIds(itemId)) {
                const tabId = External.instance.tabItemCorrespondence.getTabIdBy(subtreeItemId)
                if (tabId !== undefined) {
                  // chrome.tabs.onRemovedイベントリスナー内でウェブページ項目が削除されないよう根回しする
                  External.instance.tabIdsToBeClosedForUnloading.add(tabId)

                  // 対応するタブを閉じる
                  chrome.tabs.remove(tabId)
                }
              }
              break
          }
        })
      },
      onTabsCountContextMenu: (event: Event) => {
        event.preventDefault()

        External.instance.dialogState = {type: 'TabsDialog', targetItemId: itemId}
        Rerenderer.instance.rerender()
      },
    }
  })
}

function getAudiblePageIds(): Set<ItemId> {
  const audibleTabIds = External.instance.tabItemCorrespondence.getAllAudibleTabIds()
  const audibleItemIds = audibleTabIds
    .map((tabId) => External.instance.tabItemCorrespondence.getItemIdBy(tabId))
    .filter((itemId) => itemId !== undefined) as List<ItemId>

  return Set(audibleItemIds.flatMap(CurrentState.getPageIdsBelongingTo))
}

function unmountPage(itemId: number, activePageId: number) {
  if (itemId === TOP_ITEM_ID) return

  Internal.instance.saveCurrentStateToUndoStack()
  CurrentState.unmountPage(itemId)

  // もしアクティブページなら、最も新しいページを新たなアクティブページとする
  if (itemId === activePageId) {
    const lastPageId = CurrentState.getFilteredMountedPageIds().last(undefined)
    assertNonUndefined(lastPageId)
    CurrentState.switchActivePage(lastPageId)
  }

  Rerenderer.instance.rerender()
}
