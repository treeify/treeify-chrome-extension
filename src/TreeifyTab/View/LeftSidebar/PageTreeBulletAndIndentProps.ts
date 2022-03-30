import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type PageTreeBulletAndIndentProps = {
  bulletState: PageTreeBulletState
  outerCircleSizeEm: integer
  cssClasses: RArray<string>
  onClick(): void
}

export enum PageTreeBulletState {
  NO_CHILDREN,
  UNFOLDED,
  FOLDED,
}

export function createPageTreeBulletAndIndentProps(
  descendantsCount: integer,
  itemPath: ItemPath
): PageTreeBulletAndIndentProps {
  const cssClasses = Internal.instance.state.items[ItemPath.getItemId(itemPath)].cssClasses
  const outerCircleSizeEm = calculateOuterCircleSizeEm(descendantsCount, itemPath)

  function onClick() {
    CurrentState.setIsFolded(itemPath, !CurrentState.getIsFolded(itemPath))
    Rerenderer.instance.rerender()
  }

  if (descendantsCount > 0) {
    if (ItemPath.hasParent(itemPath) && CurrentState.getIsFolded(itemPath)) {
      return {
        bulletState: PageTreeBulletState.FOLDED,
        outerCircleSizeEm,
        cssClasses,
        onClick,
      }
    } else {
      return {
        bulletState: PageTreeBulletState.UNFOLDED,
        outerCircleSizeEm,
        cssClasses,
        onClick,
      }
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
      outerCircleSizeEm,
      cssClasses,
      onClick,
    }
  }
}

function calculateOuterCircleSizeEm(descendantsCount: integer, itemPath: ItemPath): number {
  if (ItemPath.hasParent(itemPath) && CurrentState.getIsFolded(itemPath)) {
    const outerCircleMinSize = CssCustomProperty.getNumber(
      '--page-tree-bullet-outer-circle-min-size-em'
    )
    assertNonUndefined(outerCircleMinSize)
    const outerCircleMaxSize = CssCustomProperty.getNumber(
      '--page-tree-bullet-outer-circle-max-size-em'
    )
    assertNonUndefined(outerCircleMaxSize)
    const outerCircleItemCountLimit = CssCustomProperty.getNumber(
      '--page-tree-bullet-outer-circle-item-count-limit'
    )
    assertNonUndefined(outerCircleItemCountLimit)
    const step = (outerCircleMaxSize - outerCircleMinSize) / outerCircleItemCountLimit
    const limitedHiddenItemsCount = Math.min(descendantsCount, outerCircleItemCountLimit)
    return outerCircleMinSize + limitedHiddenItemsCount * step
  } else {
    return 0
  }
}
