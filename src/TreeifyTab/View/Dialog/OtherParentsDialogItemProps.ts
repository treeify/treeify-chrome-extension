import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export type OtherParentsDialogItemProps = {
  itemContentProps: ItemContentProps
  onClick(): void
}

export function createOtherParentsDialogItemProps(itemPath: ItemPath): OtherParentsDialogItemProps {
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  return {
    itemContentProps: createItemContentProps(parentItemId),
    onClick() {
      CurrentState.jumpTo(itemPath)

      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
