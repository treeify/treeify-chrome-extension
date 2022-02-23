import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray } from 'src/Utility/fp-ts'

export type ContextProps = {
  pageId: ItemId
  parentItemId: ItemId
  siblingItemIds: RArray<ItemId>
  selfItemId: ItemId
  onClick(event: MouseEvent): void
}

export function createContextProps(itemPath: ItemPath): ContextProps {
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)

  return {
    pageId: ItemPath.getRootItemId(itemPath),
    parentItemId,
    siblingItemIds: Internal.instance.state.items[parentItemId].childItemIds,
    selfItemId: ItemPath.getItemId(itemPath),
    onClick(event) {
      event.preventDefault()

      CurrentState.jumpTo(itemPath)

      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
