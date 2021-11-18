import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CiteProps, createCiteProps } from 'src/TreeifyTab/View/CiteProps'

export type CodeBlockItemContentProps = {
  itemType: ItemType.CODE_BLOCK
  code: string
  language: string
  caption: string
  citeProps: CiteProps | undefined
}

export function createCodeBlockItemContentProps(itemId: ItemId): CodeBlockItemContentProps {
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  return {
    itemType: ItemType.CODE_BLOCK,
    code: codeBlockItem.code,
    language: codeBlockItem.language,
    caption: codeBlockItem.caption,
    citeProps: createCiteProps(itemId),
  }
}
