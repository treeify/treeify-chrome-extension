import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CiteProps, createCiteProps } from 'src/TreeifyTab/View/CiteProps'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type CodeBlockItemContentProps = {
  code: string
  language: string
  caption: string
  citeProps: CiteProps | undefined
}

export function createCodeBlockItemContentProps(itemId: ItemId): ItemContentProps {
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  return {
    type: 'CodeBlockItemContentProps',
    code: codeBlockItem.code,
    language: codeBlockItem.language,
    caption: codeBlockItem.caption,
    citeProps: createCiteProps(itemId),
  }
}
