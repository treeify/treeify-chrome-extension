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
  // contenteditableな要素のinnerHTMLは原則としてlit-htmlで描画するべきでないので、自前でDOM要素を作る
  const contentEditableElement = document.createElement('div')
  contentEditableElement.id = ItemTreeTextContentView.domElementId(viewModel.itemPath)
  contentEditableElement.className = 'item-tree-text-content_content-editable'
  contentEditableElement.setAttribute('contenteditable', 'true')
  contentEditableElement.appendChild(DomishObject.toDocumentFragment(viewModel.domishObjects))
  contentEditableElement.addEventListener('input', viewModel.onInput as any)
  contentEditableElement.addEventListener('compositionend', viewModel.onCompositionEnd as any)
  contentEditableElement.addEventListener('focus', viewModel.onFocus as any)

  // ↓innerHTMLに空白テキストノードが入るとキャレット位置の計算が難しくなるのでその対策
  // prettier-ignore
  return html`<div
    class="item-tree-text-content"
  >${contentEditableElement}</div>`
}

export namespace ItemTreeTextContentView {
  /** DOM描画後にキャレット位置を設定するために用いる */
  export function domElementId(itemPath: ItemPath): string {
    return `ItemTreeTextContentView:${itemPath.toString()}`
  }
}
