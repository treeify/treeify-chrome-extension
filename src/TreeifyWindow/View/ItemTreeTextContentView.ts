import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'

export type ItemTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
  onInput: (event: InputEvent) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onFocus: (event: FocusEvent) => void
}

/** テキストアイテムのコンテンツ領域のView */
export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel): TemplateResult {
  // ↓innerHTMLに空白テキストノードが入るとキャレット位置の計算が難しくなるのでその対策
  // prettier-ignore
  return html`<div
    class="item-tree-text-content"
    contenteditable
    @input=${viewModel.onInput}
    @compositionend=${viewModel.onCompositionEnd}
    @focus=${viewModel.onFocus}
  >${(DomishObject.toDocumentFragment(viewModel.domishObjects))}</div>`
}
