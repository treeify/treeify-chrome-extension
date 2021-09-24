import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type TabsDialogItemProps = {
  itemPath: ItemPath
  onClick: () => void
}

export function createTabsDialogItemProps(itemPath: ItemPath): TabsDialogItemProps {
  return {
    itemPath,
    onClick() {
      CurrentState.jumpTo(itemPath)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
