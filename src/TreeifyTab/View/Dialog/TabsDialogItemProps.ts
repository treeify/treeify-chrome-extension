import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type TabsDialogItemProps = {
  itemPath: ItemPath
  children: RArray<TabsDialogItemProps>
  isAudible: boolean
  footprintRank: integer | undefined
  footprintCount: integer
  onClick(event: MouseEvent): void
}

export function createTabsDialogItemProps(
  itemPath: ItemPath,
  children: RArray<TabsDialogItemProps>,
  footprintRank: integer | undefined,
  footprintCount: integer
): TabsDialogItemProps {
  const tab = External.instance.tabItemCorrespondence.getTabByItemId(ItemPath.getItemId(itemPath))

  return {
    itemPath,
    children,
    isAudible: tab?.audible === true,
    footprintRank,
    footprintCount,
    onClick(event) {
      event.preventDefault()
      CurrentState.jumpTo(itemPath)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
