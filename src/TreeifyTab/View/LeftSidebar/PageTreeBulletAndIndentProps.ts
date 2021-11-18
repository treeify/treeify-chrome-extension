import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type PageTreeBulletAndIndentProps = {
  bulletState: PageTreeBulletState
  onClick: () => void
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
  function onClick() {
    doWithErrorCapture(() => {
      CurrentState.setIsCollapsed(itemPath, !CurrentState.getIsCollapsed(itemPath))
      Rerenderer.instance.rerender()
    })
  }

  if (hasChildren) {
    if (ItemPath.hasParent(itemPath) && CurrentState.getIsCollapsed(itemPath)) {
      return {
        bulletState: PageTreeBulletState.COLLAPSED,
        onClick,
      }
    } else {
      return {
        bulletState: PageTreeBulletState.EXPANDED,
        onClick,
      }
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
      onClick,
    }
  }
}
