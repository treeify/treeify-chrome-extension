import {List} from 'immutable'
import {html} from 'lit-html'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'

export type PageTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function PageTreeTextContentView(viewModel: PageTreeTextContentViewModel) {
  return html`<div>${DomishObject.toDocumentFragment(viewModel.domishObjects)}</div>`
}
