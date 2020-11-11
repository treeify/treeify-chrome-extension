import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
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
    id=${ItemTreeTextContentView.domElementId(viewModel.itemPath)}
    @input=${viewModel.onInput}
    @compositionend=${viewModel.onCompositionEnd}
    @focus=${viewModel.onFocus}
  >${(DomishObject.toDocumentFragment(viewModel.domishObjects))}</div>`
}

export namespace ItemTreeTextContentView {
  /** DOM描画後にキャレット位置を設定するために用いる */
  export function domElementId(itemPath: ItemPath): string {
    return `ItemTreeTextContentView:${itemPath.toString()}`
  }
}
