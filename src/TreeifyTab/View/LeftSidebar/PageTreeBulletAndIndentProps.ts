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
  UNFOLDED,
  FOLDED,
}

export function createPageTreeBulletAndIndentProps(
  hasChildren: boolean,
  itemPath: ItemPath
): PageTreeBulletAndIndentProps {
  function onClick() {
    doWithErrorCapture(() => {
      CurrentState.setIsFolded(itemPath, !CurrentState.getIsFolded(itemPath))
      Rerenderer.instance.rerender()
    })
  }

  if (hasChildren) {
    if (ItemPath.hasParent(itemPath) && CurrentState.getIsFolded(itemPath)) {
      return {
        bulletState: PageTreeBulletState.FOLDED,
        onClick,
      }
    } else {
      return {
        bulletState: PageTreeBulletState.UNFOLDED,
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
