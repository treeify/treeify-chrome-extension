import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

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
