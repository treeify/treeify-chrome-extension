import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { RArray } from 'src/Utility/fp-ts'

export type TabsDialogItemProps = {
  itemPath: ItemPath
  children: RArray<TabsDialogItemProps>
  onClick(event: MouseEvent): void
}

export function createTabsDialogItemProps(
  itemPath: ItemPath,
  children: RArray<TabsDialogItemProps>
): TabsDialogItemProps {
  return {
    itemPath,
    children,
    onClick(event) {
      event.preventDefault()
      CurrentState.jumpTo(itemPath)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
