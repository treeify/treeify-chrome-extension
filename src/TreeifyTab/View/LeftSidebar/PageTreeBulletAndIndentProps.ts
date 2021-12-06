import { List } from 'immutable'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type PageTreeBulletAndIndentProps = {
  bulletState: PageTreeBulletState
  cssClasses: List<string>
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
  const cssClasses = Internal.instance.state.items[ItemPath.getItemId(itemPath)].cssClasses

  function onClick() {
    CurrentState.setIsFolded(itemPath, !CurrentState.getIsFolded(itemPath))
    Rerenderer.instance.rerender()
  }

  if (hasChildren) {
    if (ItemPath.hasParent(itemPath) && CurrentState.getIsFolded(itemPath)) {
      return {
        bulletState: PageTreeBulletState.FOLDED,
        cssClasses,
        onClick,
      }
    } else {
      return {
        bulletState: PageTreeBulletState.UNFOLDED,
        cssClasses,
        onClick,
      }
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
      cssClasses,
      onClick,
    }
  }
}
