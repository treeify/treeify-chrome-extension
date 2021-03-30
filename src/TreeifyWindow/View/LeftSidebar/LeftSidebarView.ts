import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createPageTreeViewModel,
  PageTreeView,
  PageTreeViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'

export type LeftSidebarViewModel = {
  pageTreeViewModel: PageTreeViewModel
  isFloating: boolean
  onMouseLeave: () => void
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
      onMouseLeave,
    }
  } else if (state.isFloatingLeftSidebarShown) {
    return {
      pageTreeViewModel: createPageTreeViewModel(state),
      isFloating: true,
      onMouseLeave,
    }
  }

  return undefined
}

function onMouseLeave() {
  CurrentState.setIsFloatingLeftSidebarShown(false)
  CurrentState.commit()
}

export function LeftSidebarView(viewModel: LeftSidebarViewModel) {
  return html`<aside
    class=${classMap({
      'left-sidebar': true,
      floating: viewModel.isFloating,
    })}
    @mouseleave=${viewModel.onMouseLeave}
  >
    ${PageTreeView(viewModel.pageTreeViewModel)}
  </aside>`
}
