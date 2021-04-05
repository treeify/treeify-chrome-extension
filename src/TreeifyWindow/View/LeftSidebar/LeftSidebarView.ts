import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {External} from 'src/TreeifyWindow/External/External'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {
  createPageTreeViewModel,
  PageTreeView,
  PageTreeViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'

export type LeftSidebarViewModel = {
  pageTreeViewModel: PageTreeViewModel
  isFloating: boolean
}

/**
 * 左サイドバーのViewModelを作る。
 * 左サイドバーを非表示にする場合はundefinedを返す。
 */
export function createLeftSidebarViewModel(state: State): LeftSidebarViewModel | undefined {
  // Treeifyウィンドウの横幅が画面横幅の50%以上のときは左サイドバーを表示する。
  // window.outerWidthを使うとウィンドウ最大化および最大化解除時に実態と異なる値になる（Macで確認済み）。
  // TODO: スレッショルドを50%固定ではなく変更可能にする
  if (window.innerWidth >= screen.width * 0.5) {
    return {
      pageTreeViewModel: createPageTreeViewModel(state),
      isFloating: false,
    }
  } else if (External.instance.shouldFloatingLeftSidebarShown) {
    return {
      pageTreeViewModel: createPageTreeViewModel(state),
      isFloating: true,
    }
  }

  return undefined
}

export function LeftSidebarView(viewModel: LeftSidebarViewModel) {
  return html`<aside
    class=${classMap({
      'left-sidebar': true,
      floating: viewModel.isFloating,
    })}
  >
    ${PageTreeView(viewModel.pageTreeViewModel)}
  </aside>`
}

export const LeftSidebarViewCss = css`
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: hsl(0, 0%, 98%);

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;

    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --page-tree-favicon-size: 1em;
  }

  .left-sidebar {
    flex-basis: var(--left-sidebar-width);
    flex-shrink: 0;

    /* サイドバーやアイテムツリーは独立してスクロール可能とする */
    overflow: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 1.5px 0 3px hsl(0, 0%, 85%);
  }

  /* フローティング型の左サイドバー */
  .left-sidebar.floating {
    position: fixed;
    height: 100%;
    width: var(--left-sidebar-width);
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }

  .page-tree-web-page-content {
    /* ファビコンとタイトルを横に並べる */
    display: flex;
    align-items: center;
  }

  .page-tree-web-page-content_favicon {
    width: var(--page-tree-favicon-size);
    height: var(--page-tree-favicon-size);
  }
`
