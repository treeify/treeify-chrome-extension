import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTreeContentView'

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
  contentEditableElement.id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  contentEditableElement.className = 'item-tree-text-content_content-editable'
  contentEditableElement.setAttribute('contenteditable', 'true')
  contentEditableElement.appendChild(DomishObject.toDocumentFragment(viewModel.domishObjects))
  contentEditableElement.addEventListener('input', viewModel.onInput as any)
  contentEditableElement.addEventListener('compositionend', viewModel.onCompositionEnd as any)
  contentEditableElement.addEventListener('focus', viewModel.onFocus as any)

  return html`<div class="item-tree-text-content">${contentEditableElement}</div>`
}
