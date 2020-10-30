import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'

export type ItemTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

/** テキストアイテムのコンテンツ領域のView */
export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel): TemplateResult {
  return html`<div contenteditable>${DomishObject.toTemplateResult(viewModel.domishObjects)}</div>`
}
