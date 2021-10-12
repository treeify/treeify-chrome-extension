import {List, Set} from 'immutable'
import {TabsDialog} from 'src/TreeifyTab/External/DialogState'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {
  createTabsDialogItemProps,
  TabsDialogItemProps,
} from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'

export type TabsDialogProps = {
  items: List<TabsDialogItemProps>
}

export function createTabsDialogProps(dialog: TabsDialog): TabsDialogProps {
  if (Internal.instance.state.items[dialog.targetItemId] === undefined) {
    // 対象項目が削除されてしまった場合
    return {
      items: List.of(),
    }
  }

  const webPageItemIds = Set(CurrentState.getSubtreeItemIds(dialog.targetItemId)).filter(
    (itemId) => External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined
  )
  const rootNode = CurrentState.treeify(
    webPageItemIds.add(dialog.targetItemId),
    dialog.targetItemId
  )
  return {
    items: List(rootNode.children).map((tree) => {
      return tree.fold((itemPath, children: TabsDialogItemProps[]) =>
        createTabsDialogItemProps(itemPath, List(children))
      )
    }),
  }
}
