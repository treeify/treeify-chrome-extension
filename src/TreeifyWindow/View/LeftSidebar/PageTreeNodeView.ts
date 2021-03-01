import {Collection, List, Seq} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {integer, ItemId, TOP_ITEM_ID} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  createPageTreeContentViewModel,
  PageTreeContentView,
  PageTreeContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeContentView'

export type PageTreeNodeViewModel = {
  contentViewModel: PageTreeContentViewModel
  childNodeViewModels: List<PageTreeNodeViewModel>
  onClickContentView: () => void
  isActivePage: boolean
}

export function createPageTreeRootNodeViewModel(state: State): PageTreeNodeViewModel {
  const itemPaths = Object.keys(state.mountedPages).flatMap((itemId) => [
    ...searchItemPathForMountedPage(state, List.of(parseInt(itemId))),
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
  return {
    contentViewModel: createPageTreeContentViewModel(state, itemId),
    childNodeViewModels: childPagePaths.map((childPagePath) =>
      createPageTreeNodeViewModel(state, childPagePath.itemId, pageTreeEdges)
    ),
    onClickContentView: () => {
      NextState.setActivePageId(itemId)
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
  if (itemIds.size > 1 && state.mountedPages[itemId] !== undefined) {
    yield new ItemPath(itemIds)
    return
  }

  for (const parentItemId of state.items[itemId].parentItemIds) {
    yield* searchItemPathForMountedPage(state, itemIds.unshift(parentItemId))
  }
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel): TemplateResult {
  return html`<div class="page-tree-node">
    <div
      class=${classMap({
        'page-tree-node_body-area': true,
        'active-page': viewModel.isActivePage,
      })}
    >
      <div class="page-tree-node_content-area" @click=${viewModel.onClickContentView}>
        ${PageTreeContentView(viewModel.contentViewModel)}
      </div>
      <div class="page-tree-node_close-button"></div>
    </div>
    ${viewModel.childNodeViewModels.map(PageTreeNodeView)}
  </div>`
}
