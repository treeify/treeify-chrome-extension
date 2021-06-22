import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type TexItemContentProps = {
  itemType: ItemType.TEX
  code: string
}

export function createTexItemContentProps(itemId: ItemId): TexItemContentProps {
  return {
    itemType: ItemType.TEX,
    code: Internal.instance.state.texItems[itemId].code,
  }
}
