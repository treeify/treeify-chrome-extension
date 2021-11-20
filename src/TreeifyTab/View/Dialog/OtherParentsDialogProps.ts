import { is, List, Set } from 'immutable'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import {
  createOtherParentsDialogPageProps,
  OtherParentsDialogPageProps,
} from 'src/TreeifyTab/View/Dialog/OtherParentsDialogPageProps'

export type OtherParentsDialogProps = {
  pagePropses: List<OtherParentsDialogPageProps>
}

export function createOtherParentsDialogProps(): OtherParentsDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const parentItemIds = CurrentState.getParentItemIds(targetItemId)
  const itemPaths = parentItemIds
    .map((parentItemId) => Set(CurrentState.yieldItemPaths(parentItemId)))
    .flatMap((x) => x)
    .map((itemPath) => itemPath.push(targetItemId))
    .filter((itemPath) => !is(itemPath, targetItemPath))
  return {
    pagePropses: itemPaths
      .groupBy((itemPath) => ItemPath.getRootItemId(itemPath))
      .toList()
      .map((itemPaths) => createOtherParentsDialogPageProps(itemPaths.toList())),
  }
}
