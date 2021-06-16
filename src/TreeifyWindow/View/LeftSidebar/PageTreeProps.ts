import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createPageTreeRootNodeProps,
  PageTreeNodeProps,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeNodeProps'

export type PageTreeProps = {
  pageTreeRootNodeProps: PageTreeNodeProps
}

export function createPageTreeProps(state: State): PageTreeProps {
  return {
    pageTreeRootNodeProps: createPageTreeRootNodeProps(state),
  }
}
