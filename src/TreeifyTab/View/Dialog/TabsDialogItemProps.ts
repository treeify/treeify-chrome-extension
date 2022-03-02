import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type TabsDialogItemProps = {
  itemPath: ItemPath
  children: RArray<TabsDialogItemProps>
  isAudible: boolean
  footprintRank: integer | undefined
  footprintCount: integer
  outerCircleRadiusEm: integer
  onClick(event: MouseEvent): void
}

export function createTabsDialogItemProps(
  itemPath: ItemPath,
  children: RArray<TabsDialogItemProps>,
  footprintRank: integer | undefined,
  footprintCount: integer
): TabsDialogItemProps {
  const itemId = ItemPath.getItemId(itemPath)
  const tab = External.instance.tabItemCorrespondence.getTabByItemId(itemId)

  return {
    itemPath,
    children,
    isAudible: tab?.audible === true,
    footprintRank,
    footprintCount,
    outerCircleRadiusEm: calculateOuterCircleRadiusEm(itemId),
    onClick(event) {
      event.preventDefault()
      CurrentState.jumpTo(itemPath)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}

function calculateOuterCircleRadiusEm(itemId: ItemId): number {
  const childItemCount = Internal.instance.state.items[itemId].childItemIds.length
  if (childItemCount === 0) return 0

  const outerCircleMinDiameter =
    CssCustomProperty.getNumber('--bullet-outer-circle-min-diameter-em') ?? 1.05
  const outerCircleMaxDiameter =
    CssCustomProperty.getNumber('--bullet-outer-circle-max-diameter-em') ?? 1.3
  const outerCircleChildCountLimit =
    CssCustomProperty.getNumber('--bullet-outer-circle-child-count-limit') ?? 10
  const step = (outerCircleMaxDiameter - outerCircleMinDiameter) / outerCircleChildCountLimit
  const limitedHiddenItemsCount = Math.min(childItemCount, outerCircleChildCountLimit)
  return outerCircleMinDiameter + limitedHiddenItemsCount * step
}
