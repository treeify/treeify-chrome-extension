import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CssCustomProperty } from 'src/Utility/browser'
import { integer } from 'src/Utility/integer'

export type AdjacentSiblingItemProps = {
  itemId: ItemId
  isMyself: boolean
  outerCircleSizeEm: integer
}

export function createAdjacentSiblingItemProps(
  itemId: ItemId,
  isMyself: boolean
): AdjacentSiblingItemProps {
  return {
    itemId,
    isMyself,
    outerCircleSizeEm: calculateOuterCircleSizeEm(itemId),
  }
}

function calculateOuterCircleSizeEm(itemId: ItemId): number {
  const childItemCount = Internal.instance.state.items[itemId].childItemIds.length
  if (childItemCount === 0) return 0

  const outerCircleMinSize =
    CssCustomProperty.getNumber('--bullet-outer-circle-min-size-em') ?? 1.05
  const outerCircleMaxSize =
    CssCustomProperty.getNumber('--bullet-outer-circle-max-size-em') ?? 1.25
  const outerCircleChildCountLimit =
    CssCustomProperty.getNumber('--bullet-outer-circle-child-count-limit') ?? 10
  const step = (outerCircleMaxSize - outerCircleMinSize) / outerCircleChildCountLimit
  const limitedHiddenItemsCount = Math.min(childItemCount, outerCircleChildCountLimit)
  return outerCircleMinSize + limitedHiddenItemsCount * step
}
