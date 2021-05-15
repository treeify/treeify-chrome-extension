import Color from 'color'
import {Collection, List, Seq} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {styleMap} from 'lit-html/directives/style-map'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, TOP_ITEM_ID} from 'src/TreeifyWindow/basicType'
import {CssCustomProperty} from 'src/TreeifyWindow/CssCustomProperty'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
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
  pageTreeEdges: Seq.Keyed<ItemId, Collection<integer, ItemPath>>,
  filteredPageIds: List<ItemId>
): PageTreeNodeViewModel {
  const childPagePaths = pageTreeEdges.get(itemId)?.toList() ?? List.of()
  const hasChildren = !pageTreeEdges.get(itemId, List()).isEmpty()

  // TODO: パラメータをカスタマイズ可能にする
  const footprintCount = Math.floor(Math.pow(filteredPageIds.size, 0.7))
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
          const hottestPageId = Internal.instance.state.mountedPageIds
            .map((pageId) => {
              return {
                pageId,
                timestamp: Internal.instance.state.items[pageId].timestamp,
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

        const edge = CurrentState.removeItemGraphEdge(
          ItemPath.getParentItemId(draggedItemPath)!,
          draggedItemId
        )
        CurrentState.insertFirstChildItem(itemId, draggedItemId, edge)

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
  if (itemIds.size > 1 && state.mountedPageIds.contains(itemId)) {
    yield itemIds
    return
  }

  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield* searchItemPathForMountedPage(state, itemIds.unshift(parentItemId))
  }
}

export function PageTreeNodeView(viewModel: PageTreeNodeViewModel): TemplateResult {
  const footprintColor = calculateFootprintColor(viewModel.footprintRank, viewModel.footprintCount)
  const footprintLayerStyle = styleMap({
    backgroundColor: footprintColor?.toString() ?? '',
  })

  return html`<div class="page-tree-node">
    ${!viewModel.isRoot
      ? html`<div class="page-tree-node_bullet-and-indent-area">
          ${PageTreeBulletAndIndentView(viewModel.bulletAndIndentViewModel)}
        </div>`
      : html`<div class="grid-empty-cell"></div>`}
    <div class="page-tree-node_body-and-children-area">
      <div class="page-tree-node_footprint-layer" style=${footprintLayerStyle}>
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
      </div>
      <div class="page-tree-node_children-area">
        ${viewModel.childNodeViewModels.map(PageTreeNodeView)}
      </div>
    </div>
  </div>`
}

function calculateFootprintColor(
  footprintRank: integer | undefined,
  footprintCount: integer
): Color | undefined {
  if (footprintRank === undefined) return undefined

  const strongestColor = CssCustomProperty.getColor('--page-tree-strongest-footprint-color')
  const weakestColor = CssCustomProperty.getColor('--page-tree-weakest-footprint-color')

  if (footprintCount === 1) {
    return strongestColor
  }

  // 線形補間する
  const ratio = footprintRank / (footprintCount - 1)
  return strongestColor.mix(weakestColor, ratio)
}

export const PageTreeNodeCss = css`
  :root {
    /* ページツリーの項目のマウスホバー時の背景色 */
    --page-tree-hover-item-background-color: hsl(0, 0%, 95%);

    /* ページツリーのアクティブページの背景色 */
    --page-tree-active-page-background-color: hsl(0, 0%, 90%);

    /* 最も新しい足跡の色（線形補間の一端） */
    --page-tree-strongest-footprint-color: hsl(0, 90%, 96%);
    /* 最も古い足跡の色（線形補間の一端） */
    --page-tree-weakest-footprint-color: hsl(60, 90%, 96%);

    /* 閉じるボタンのサイズ（正方形の一辺の長さ） */
    --page-tree-close-button-size: 1.1em;
  }

  .page-tree-node {
    /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  /* ページツリーの各ノードのコンテンツ領域と右端のボタン類を並べた領域 */
  .page-tree-node_body-area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
  .page-tree-node_body-area.active-page {
    /* アクティブページの強調表示 */
    background: var(--page-tree-active-page-background-color);
  }

  .page-tree-node_body-area:hover {
    background: var(--page-tree-hover-item-background-color);
  }

  .page-tree-node_content-area {
    cursor: default;

    /* ページツリーではテキストは折り返さない */
    overflow-x: hidden;
    white-space: nowrap;
  }

  .page-tree-node_close-button {
    width: var(--page-tree-close-button-size);
    height: var(--page-tree-close-button-size);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 20%);
    -webkit-mask-image: url('close-icon2.svg');

    /* マウスホバー時にのみ表示 */
    display: none;

    /* ボタンであることを示す */
    cursor: pointer;
  }
  .page-tree-node_body-area:hover .page-tree-node_close-button {
    /* マウスホバー時にのみ表示 */
    display: initial;
  }
`
