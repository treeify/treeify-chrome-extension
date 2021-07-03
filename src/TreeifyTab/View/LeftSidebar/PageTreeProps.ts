import {State} from 'src/TreeifyTab/Internal/State'
import {
  createPageTreeRootNodeProps,
  PageTreeNodeProps,
} from 'src/TreeifyTab/View/LeftSidebar/PageTreeNodeProps'

export type PageTreeProps = {
  pageTreeRootNodeProps: PageTreeNodeProps
}

export function createPageTreeProps(state: State): PageTreeProps {
  return {
    pageTreeRootNodeProps: createPageTreeRootNodeProps(state),
  }
}
