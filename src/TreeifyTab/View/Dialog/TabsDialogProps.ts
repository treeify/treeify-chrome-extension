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
  const webPageItemPaths = webPageItemIds.flatMap(CurrentState.yieldItemPaths)
  // TODO: 検索結果と同じようにツリー化する
  return {
    items: webPageItemPaths.toList().map(createTabsDialogItemProps),
  }
}
