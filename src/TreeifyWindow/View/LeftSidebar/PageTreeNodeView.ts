import {Collection, List, Seq} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {integer, ItemId, TOP_ITEM_ID} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
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
import {External} from 'src/TreeifyWindow/External/External'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type PageTreeNodeViewModel = {
  bulletAndIndentViewModel: PageTreeBulletAndIndentViewModel
  contentViewModel: PageTreeContentViewModel
  childNodeViewModels: List<PageTreeNodeViewModel>
  onClickContentArea: () => void
  onClickCloseButton: () => void
  onDragOver: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
  isActivePage: boolean
  isRoot: boolean
}

export function createPageTreeRootNodeViewModel(state: State): PageTreeNodeViewModel {
  const itemPaths = state.mountedPageIds.flatMap((itemId) => [
    ...searchItemPathForMountedPage(state, List.of(itemId)),
  ])
  const pageTreeEdges = List(itemPaths)
    .groupBy((value) => ItemPath.getRootItemId(value))
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
  for (let i = 1; i < itemPath.size; i++) {
    const childItemIds = Internal.instance.state.items[itemPath.get(i - 1)!].childItemIds
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
  pageTreeEdges: Seq.Keyed<ItemId, Collection<integer, ItemPath>>
): PageTreeNodeViewModel {
  const childPagePaths = pageTreeEdges.get(itemId)?.toList() ?? List.of()
  const hasChildren = !pageTreeEdges.get(itemId, List()).isEmpty()
  return {
    bulletAndIndentViewModel: createPageTreeBulletAndIndentViewModel(hasChildren),
    contentViewModel: createPageTreeContentViewModel(state, itemId),
    childNodeViewModels: childPagePaths.map((childPagePath) =>
      createPageTreeNodeViewModel(state, ItemPath.getItemId(childPagePath), pageTreeEdges)
    ),
    onClickContentArea: () => {
      doWithErrorHandling(() => {
        CurrentState.setActivePageId(itemId)
        // ページ切り替え後はフローティングサイドバーが邪魔になるので非表示にする
        CurrentState.setIsFloatingLeftSidebarShown(false)

        // ページ切り替え後はそのページのターゲットアイテムをフォーカス
        const elementId = ItemTreeContentView.focusableDomElementId(
          CurrentState.getTargetItemPath()
        )
        External.instance.requestFocusAfterRendering(elementId)

        CurrentState.commit()
      })
    },
    onClickCloseButton: () => {
      doWithErrorHandling(() => {
        CurrentState.unmountPage(itemId)

        // もしアクティブページなら、タイムスタンプが最も新しいページを新たなアクティブページとする
        if (itemId === Internal.instance.state.activePageId) {
          const hottestPageId = Internal.instance.state.mountedPageIds
            .map((pageId) => {
              return {
                pageId,
                timestamp: Internal.instance.state.items[pageId].timestamp,
              }
            })
            .maxBy((a) => a.timestamp)!.pageId
          CurrentState.setActivePageId(hottestPageId)
          // ページ切り替え後はそのページのターゲットアイテムをフォーカス
          const elementId = ItemTreeContentView.focusableDomElementId(
            CurrentState.getTargetItemPath()
          )
          External.instance.requestFocusAfterRendering(elementId)
        }

        CurrentState.commit()
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
        const draggedItemPath: ItemPath = List(JSON.parse(data))
        const draggedItemId = ItemPath.getItemId(draggedItemPath)

        // TODO: 循環チェックをしないと親子間でのドロップとかで壊れるぞ
        // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
        if (ItemPath.getParentItemId(draggedItemPath) === undefined) return

        CurrentState.removeItemGraphEdge(ItemPath.getParentItemId(draggedItemPath)!, draggedItemId)

        CurrentState.insertFirstChildItem(itemId, draggedItemId)
        CurrentState.updateItemTimestamp(draggedItemId)
        CurrentState.commit()
      })
    },
    isActivePage: state.activePageId === itemId,
    isRoot: itemId === TOP_ITEM_ID,
  }
}

// マウント済みページを先祖方向に探索し、そのページまでのItemPathを返す。
// 複数該当する場合はすべて返す。
function* searchItemPathForMountedPage(state: State, itemIds: List<ItemId>): Generator<ItemPath> {
  const itemId = itemIds.first(undefined)
  assertNonUndefined(itemId)

  // もし他のマウント済みページに到達したら、そのページまでの経路を返す
  if (itemIds.size > 1 && state.mountedPageIds.contains(itemId)) {
    yield itemIds
    return
  }

  for (const parentItemId of state.items[itemId].parents) {
    yield* searchItemPathForMountedPage(state, itemIds.unshift(parentItemId))
  }
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel): TemplateResult {
  return html`<div class="page-tree-node">
    ${!viewModel.isRoot
      ? html`<div class="page-tree-node_bullet-and-indent-area">
          ${PageTreeBulletAndIndentView(viewModel.bulletAndIndentViewModel)}
        </div>`
      : undefined}
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
