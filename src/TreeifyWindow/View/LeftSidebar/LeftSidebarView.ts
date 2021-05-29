import {External} from 'src/TreeifyWindow/External/External'
import {State} from 'src/TreeifyWindow/Internal/State'
import {classMap, createElement} from 'src/TreeifyWindow/View/createElement'
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
  return createElement(
    'aside',
    classMap({
      'left-sidebar': true,
      floating: viewModel.isFloating,
    }),
    {},
    [PageTreeView(viewModel.pageTreeViewModel)]
  )
}

export const LeftSidebarCss = css`
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: hsl(0, 0%, 98%);

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;
  }

  .left-sidebar {
    width: var(--left-sidebar-width);
    height: 100%;

    overflow-y: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 1.5px 0 3px hsl(0, 0%, 85%);
  }

  /* フローティング型の左サイドバー */
  .left-sidebar.floating {
    position: fixed;
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }
`
