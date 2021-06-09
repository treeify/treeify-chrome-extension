import {Collection, List, Seq} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createPageTreeBulletAndIndentViewModel,
  PageTreeBulletAndIndentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeBulletAndIndentView'
import {
  createPageTreeContentViewModel,
  PageTreeContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeContentView'
import {get} from 'svelte/store'

export type PageTreeNodeViewModel = {
  bulletAndIndentViewModel: PageTreeBulletAndIndentViewModel
  contentViewModel: PageTreeContentViewModel
  childNodeViewModels: List<PageTreeNodeViewModel>
  isActivePage: boolean
  isRoot: boolean
  footprintRank: integer | undefined
  footprintCount: integer
  onClickContentArea: () => void
  onClickCloseButton: () => void
  onDragOver: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
}

export function createPageTreeRootNodeViewModel(state: State): PageTreeNodeViewModel {
  const filteredPageIds = CurrentState.getFilteredMountedPageIds()
  const itemPaths = filteredPageIds.flatMap((itemId) => [
    ...searchItemPathForMountedPage(state, List.of(itemId)),
  ])
  const pageTreeEdges = itemPaths
    .groupBy((value) => ItemPath.getRootItemId(value))
    .map((collection) => {
      return collection.toList().sortBy((itemPath) => {
        return toSiblingRankList(itemPath)
      }, lexicographicalOrder)
    })

  return createPageTreeNodeViewModel(state, TOP_ITEM_ID, pageTreeEdges, filteredPageIds)
}

// アイテムパスを兄弟順位リストに変換する
function toSiblingRankList(itemPath: ItemPath): List<integer> {
  const siblingRankArray = []
  for (let i = 1; i < itemPath.size; i++) {
    const childItemIds = get(Internal.instance.state.items[itemPath.get(i - 1)!].childItemIds)
    siblingRankArray.push(childItemIds.indexOf(itemPath.get(i)!))
  }
  return List(siblingRankArray)
}

// 辞書式順序のcomparator
function lexicographicalOrder(lhs: List<integer>, rhs: List<integer>): integer {
  const min = Math.min(lhs.size, rhs.size)

  for (let i = 0; i < min; i++) {
    const r = rhs.get(i)!
    const l = lhs.get(i)!
    if (l > r) {
      return 1
    } else if (l < r) {
      return -1
    }
  }
  if (lhs.size === rhs.size) {
    return 0
  } else if (lhs.size > rhs.size) {
    return 1
  } else {
    return -1
  }
}

export function createPageTreeNodeViewModel(
  state: State,
  itemId: ItemId,
  pageTreeEdges: Seq.Keyed<ItemId, Collection<integer, ItemPath>>,
  filteredPageIds: List<ItemId>
): PageTreeNodeViewModel {
  const childPagePaths = pageTreeEdges.get(itemId)?.toList() ?? List.of()
  const hasChildren = !pageTreeEdges.get(itemId, List()).isEmpty()

  // TODO: パラメータをカスタマイズ可能にする
  const footprintCount = Math.floor(Math.pow(filteredPageIds.size, 0.5))
  const rank = filteredPageIds.size - filteredPageIds.indexOf(itemId) - 1

  return {
    bulletAndIndentViewModel: createPageTreeBulletAndIndentViewModel(hasChildren),
    contentViewModel: createPageTreeContentViewModel(state, itemId),
    childNodeViewModels: childPagePaths.map((childPagePath) =>
      createPageTreeNodeViewModel(
        state,
        ItemPath.getItemId(childPagePath),
        pageTreeEdges,
        filteredPageIds
      )
    ),
    isActivePage: CurrentState.getActivePageId() === itemId,
    isRoot: itemId === TOP_ITEM_ID,
    footprintRank: rank <= footprintCount ? rank : undefined,
    footprintCount,
    onClickContentArea: () => {
      doWithErrorCapture(() => {
        CurrentState.switchActivePage(itemId)
        // ページ切り替え後はフローティングサイドバーが邪魔になるので非表示にする
        External.instance.shouldFloatingLeftSidebarShown = false
        CurrentState.commit()
      })
    },
    onClickCloseButton: () => {
      doWithErrorCapture(() => {
        CurrentState.unmountPage(itemId)

        // もしアクティブページなら、タイムスタンプが最も新しいページを新たなアクティブページとする
        if (itemId === CurrentState.getActivePageId()) {
          const hottestPageId = get(Internal.instance.state.mountedPageIds)
            .map((pageId) => {
              return {
                pageId,
                timestamp: get(Internal.instance.state.items[pageId].timestamp),
              }
            })
            .maxBy((a) => a.timestamp)!.pageId
          CurrentState.switchActivePage(hottestPageId)
        }

        CurrentState.commit()
      })
    },
    onDragOver: (event) => {
      // ドロップを動作させるために必要
      event.preventDefault()
    },
    onDrop: (event) => {
      doWithErrorCapture(() => {
        if (event.dataTransfer === null || !(event.target instanceof HTMLElement)) return

        const data = event.dataTransfer.getData('application/treeify')
        const draggedItemPath: ItemPath = List(JSON.parse(data))
        const draggedItemId = ItemPath.getItemId(draggedItemPath)

        // TODO: 循環チェックをしないと親子間でのドロップとかで壊れるぞ
        // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
        if (ItemPath.getParentItemId(draggedItemPath) === undefined) return

        if (InputId.isFirstModifierKeyPressed(event)) {
          // エッジを追加する（トランスクルード）
          CurrentState.insertFirstChildItem(itemId, draggedItemId)
        } else {
          // エッジを付け替える
          const edge = CurrentState.removeItemGraphEdge(
            ItemPath.getParentItemId(draggedItemPath)!,
            draggedItemId
          )
          CurrentState.insertFirstChildItem(itemId, draggedItemId, edge)
        }

        CurrentState.updateItemTimestamp(draggedItemId)
        CurrentState.commit()
      })
    },
  }
}

// マウント済みページを先祖方向に探索し、そのページまでのItemPathを返す。
// 複数該当する場合はすべて返す。
function* searchItemPathForMountedPage(state: State, itemIds: List<ItemId>): Generator<ItemPath> {
  const itemId = itemIds.first(undefined)
  assertNonUndefined(itemId)

  // もし他のマウント済みページに到達したら、そのページまでの経路を返す
  if (itemIds.size > 1 && get(state.mountedPageIds).contains(itemId)) {
    yield itemIds
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield* searchItemPathForMountedPage(state, itemIds.unshift(parentItemId))
  }
}
