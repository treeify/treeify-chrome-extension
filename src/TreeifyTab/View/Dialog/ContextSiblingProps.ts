import { ItemId } from 'src/TreeifyTab/basicType'

export type ContextSiblingProps = {
  itemId: ItemId
  isMyself: boolean
}

export function createContextSiblingProps(itemId: ItemId, isMyself: boolean): ContextSiblingProps {
  return {
    itemId,
    isMyself,
  }
}
