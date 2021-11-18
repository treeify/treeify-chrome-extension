import { State } from 'src/TreeifyTab/Internal/State'
import { createPageTreeProps, PageTreeProps } from 'src/TreeifyTab/View/LeftSidebar/PageTreeProps'

export type LeftSidebarProps = {
  pageTreeProps: PageTreeProps
}

/**
 * 左サイドバーのPropsを作る。
 * 左サイドバーを非表示にする場合はundefinedを返す。
 */
export function createLeftSidebarProps(state: State): LeftSidebarProps {
  return {
    pageTreeProps: createPageTreeProps(state),
  }
}
