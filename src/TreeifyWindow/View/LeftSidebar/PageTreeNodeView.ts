import {Collection, List, Seq} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {integer, ItemId, TOP_ITEM_ID} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createPageTreeBulletAndIndentViewModel,
  PageTreeBulletAndIndentView,
  PageTreeBulletAndIndentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeBulletAndIndentView'
import {
  createPageTreeContentViewModel,
  PageTreeContentView,
  PageTreeContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeContentView'
import {doWithErrorHandling} from 'src/Common/Debug/report'

export type PageTreeNodeViewModel = {
  bulletAndIndentViewModel: PageTreeBulletAndIndentViewModel
  contentViewModel: PageTreeContentViewModel
  childNodeViewModels: List<PageTreeNodeViewModel>
  onClickContentArea: () => void
  onClickCloseButton: () => void
  onDragOver: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
  isActivePage: boolean
}

export function createPageTreeRootNodeViewModel(state: State): PageTreeNodeViewModel {
  const itemPaths = state.mountedPageIds.flatMap((itemId) => [
    ...searchItemPathForMountedPage(state, List.of(itemId)),
  ])
  const pageTreeEdges = List(itemPaths)
    .groupBy((value) => value.rootItemId)
    .map((collection) => {
      return collection.toList().sortBy((itemPath) => {
        return toSiblingRankList(itemPath)
      }, lexicographicalOrder)
    })

  return createPageTreeNodeViewModel(state, TOP_ITEM_ID, pageTreeEdges)
}

// アイテムパスを兄弟順位リストに変換する
function toSiblingRankList(itemPath: ItemPath): List<integer> {
  const siblingRankArray = []
  const itemIds = itemPath.itemIds
  for (let i = 1; i < itemIds.size; i++) {
    const childItemIds = NextState.getChildItemIds(itemIds.get(i - 1)!!)
    siblingRankArray.push(childItemIds.indexOf(itemIds.get(i)!!))
  }
  return List(siblingRankArray)
}

// 辞書式順序のcomparator
function lexicographicalOrder(lhs: List<integer>, rhs: List<integer>): integer {
  const min = Math.min(lhs.size, rhs.size)

  for (let i = 0; i < min; i++) {
    const r = rhs.get(i)!!
    const l = lhs.get(i)!!
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
  pageTreeEdges: Seq.Keyed<ItemId, Collection<integer, ItemPath>>
): PageTreeNodeViewModel {
  const childPagePaths = pageTreeEdges.get(itemId)?.toList() ?? List.of()
  const hasChildren = !pageTreeEdges.get(itemId, List()).isEmpty()
  return {
    bulletAndIndentViewModel: createPageTreeBulletAndIndentViewModel(hasChildren),
    contentViewModel: createPageTreeContentViewModel(state, itemId),
    childNodeViewModels: childPagePaths.map((childPagePath) =>
      createPageTreeNodeViewModel(state, childPagePath.itemId, pageTreeEdges)
    ),
    onClickContentArea: () => {
      doWithErrorHandling(() => {
        NextState.setActivePageId(itemId)
        // ページ切り替え後はフローティングサイドバーが邪魔になるので非表示にする
        NextState.setIsFloatingLeftSidebarShown(false)
        NextState.commit()
      })
    },
    onClickCloseButton: () => {
      doWithErrorHandling(() => {
        NextState.unmountPage(itemId)

        // もしアクティブページなら、タイムスタンプが最も新しいページを新たなアクティブページとする
        if (itemId === NextState.getActivePageId()) {
          const hottestPageId = NextState.getMountedPageIds()
            .map((pageId) => {
              return {
                pageId,
                timestamp: NextState.getItemTimestamp(pageId),
              }
            })
            .maxBy((a) => a.timestamp)!!.pageId
          NextState.setActivePageId(hottestPageId)
        }

        NextState.commit()
      })
    },
    onDragOver: (event) => {
      // ドロップを動作させるために必要
      event.preventDefault()
    },
    onDrop: (event) => {
      doWithErrorHandling(() => {
        if (event.dataTransfer === null || !(event.target instanceof HTMLElement)) return

        const data = event.dataTransfer.getData('application/treeify')
        const draggedItemPath = new ItemPath(List(JSON.parse(data)))

        // TODO: 循環チェックをしないと親子間でのドロップとかで壊れるぞ
        // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
        if (draggedItemPath.parentItemId === undefined) return

        NextState.removeItemGraphEdge(draggedItemPath.parentItemId, draggedItemPath.itemId)

        NextState.insertFirstChildItem(itemId, draggedItemPath.itemId)
        NextState.updateItemTimestamp(draggedItemPath.itemId)
        NextState.commit()
      })
    },

    isActivePage: state.activePageId === itemId,
  }
}

// マウント済みページを先祖方向に探索し、そのページまでのItemPathを返す。
// 複数該当する場合はすべて返す。
function* searchItemPathForMountedPage(state: State, itemIds: List<ItemId>): Generator<ItemPath> {
  const itemId = itemIds.first(undefined)
  assertNonUndefined(itemId)

  // もし他のマウント済みページに到達したら、そのページまでの経路を返す
  if (itemIds.size > 1 && state.mountedPageIds.contains(itemId)) {
    yield new ItemPath(itemIds)
    return
  }

  for (const parentItemId of state.items[itemId].parentItemIds) {
    yield* searchItemPathForMountedPage(state, itemIds.unshift(parentItemId))
  }
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel): TemplateResult {
  return html` <div class="page-tree-node">
    <div class="page-tree-node_bullet-and-indent-area">
      ${PageTreeBulletAndIndentView(viewModel.bulletAndIndentViewModel)}
    </div>
    <div class="page-tree-node_body-and-children-area">
      <div
        class=${classMap({
          'page-tree-node_body-area': true,
          'active-page': viewModel.isActivePage,
        })}
      >
        <div
          class="page-tree-node_content-area"
          @click=${viewModel.onClickContentArea}
          @dragover=${viewModel.onDragOver}
          @drop=${viewModel.onDrop}
        >
          ${PageTreeContentView(viewModel.contentViewModel)}
        </div>
        <div class="page-tree-node_close-button" @click=${viewModel.onClickCloseButton}></div>
      </div>
      <div class="page-tree-node_children-area">
        ${viewModel.childNodeViewModels.map(PageTreeNodeView)}
      </div>
    </div>
  </div>`
}
