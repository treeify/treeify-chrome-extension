import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type CodeBlockItemContentProps = {
  code: string
  language: string
  caption: string
  cssClasses: RArray<string>
}

export function createCodeBlockItemContentProps(itemId: ItemId): ItemContentProps {
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  return {
    type: 'CodeBlockItemContentProps',
    code: codeBlockItem.code,
    language: codeBlockItem.language,
    caption: codeBlockItem.caption,
    cssClasses: Internal.instance.state.items[itemId].cssClasses,
  }
}
