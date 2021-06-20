import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type CodeBlockItemContentProps = {
  itemType: ItemType.CODE_BLOCK
  code: string
  language: string
}

export function createCodeBlockItemContentProps(itemId: ItemId): CodeBlockItemContentProps {
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  return {
    itemType: ItemType.CODE_BLOCK,
    code: codeBlockItem.code,
    language: codeBlockItem.language,
  }
}
