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
  nearSiblingItemIds: RArray<ItemId>
  selfItemId: ItemId
  onClick(event: MouseEvent): void
}

/** いくつ離れた兄弟までを表示するかのパラメータ */
const DISTANCE_LIMIT = 2

export function createContextProps(itemPath: ItemPath): ContextProps {
  const parentItemId = ItemPath.getParentItemId(itemPath)
  assertNonUndefined(parentItemId)
  const selfItemId = ItemPath.getItemId(itemPath)

  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const index = siblingItemIds.indexOf(selfItemId)
  const nearSiblingItemIds = siblingItemIds.slice(
    Math.max(0, index - DISTANCE_LIMIT),
    index + DISTANCE_LIMIT + 1
  )
  return {
    pageId: ItemPath.getRootItemId(itemPath),
    parentItemId,
    nearSiblingItemIds,
    selfItemId,
    onClick(event) {
      event.preventDefault()

      CurrentState.jumpTo(itemPath)

      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
