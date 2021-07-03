import {External} from 'src/TreeifyTab/External/External'
import {State} from 'src/TreeifyTab/Internal/State'
import {createPageTreeProps, PageTreeProps} from 'src/TreeifyTab/View/LeftSidebar/PageTreeProps'

export type LeftSidebarProps = {
  pageTreeProps: PageTreeProps
  isFloating: boolean
}

/**
 * 左サイドバーのPropsを作る。
 * 左サイドバーを非表示にする場合はundefinedを返す。
 */
export function createLeftSidebarProps(state: State): LeftSidebarProps | undefined {
  // Treeifyタブの横幅が画面横幅の50%以上のときは左サイドバーを表示する。
  // window.outerWidthを使うとウィンドウ最大化および最大化解除時に実態と異なる値になる（Macで確認済み）。
  // TODO: スレッショルドを50%固定ではなく変更可能にする
  if (window.innerWidth >= screen.width * 0.5) {
    return {
      pageTreeProps: createPageTreeProps(state),
      isFloating: false,
    }
  } else if (External.instance.shouldFloatingLeftSidebarShown) {
    return {
      pageTreeProps: createPageTreeProps(state),
      isFloating: true,
    }
  }

  return undefined
}
