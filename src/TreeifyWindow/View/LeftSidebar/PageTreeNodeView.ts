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

export type PageTreeNodeViewModel = {
  bulletAndIndentViewModel: PageTreeBulletAndIndentViewModel
  contentViewModel: PageTreeContentViewModel
  childNodeViewModels: List<PageTreeNodeViewModel>
  onClickContentView: () => void
  onClickCloseButton: () => void
  isActivePage: boolean
}

export function createPageTreeRootNodeViewModel(state: State): PageTreeNodeViewModel {
  const itemPaths = state.mountedPageIds.flatMap((itemId) => [
    ...searchItemPathForMountedPage(state, List.of(itemId)),
  ])
  const pageTreeEdges = List(itemPaths).groupBy((value) => value.rootItemId)
  return createPageTreeNodeViewModel(state, TOP_ITEM_ID, pageTreeEdges)
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
    onClickContentView: () => {
      NextState.setActivePageId(itemId)
      NextState.commit()
    },
    onClickCloseButton: () => {
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
        <div class="page-tree-node_content-area" @click=${viewModel.onClickContentView}>
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
