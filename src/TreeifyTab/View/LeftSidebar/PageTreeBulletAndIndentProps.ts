import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

export type PageTreeBulletAndIndentProps = {
  bulletState: PageTreeBulletState
}

export enum PageTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
}

export function createPageTreeBulletAndIndentProps(
  hasChildren: boolean,
  itemPath: ItemPath
): PageTreeBulletAndIndentProps {
  if (hasChildren) {
    if (ItemPath.hasParent(itemPath) && CurrentState.getIsCollapsed(itemPath)) {
      return {
        bulletState: PageTreeBulletState.COLLAPSED,
      }
    } else {
      return {
        bulletState: PageTreeBulletState.EXPANDED,
      }
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
    }
  }
}
