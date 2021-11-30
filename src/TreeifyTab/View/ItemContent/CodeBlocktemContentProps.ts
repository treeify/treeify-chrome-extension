import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type CodeBlockItemContentProps = {
  code: string
  language: string
  caption: string
  sourceProps: SourceProps | undefined
}

export function createCodeBlockItemContentProps(itemId: ItemId): ItemContentProps {
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  return {
    type: 'CodeBlockItemContentProps',
    code: codeBlockItem.code,
    language: codeBlockItem.language,
    caption: codeBlockItem.caption,
    sourceProps: createSourceProps(itemId),
  }
}
