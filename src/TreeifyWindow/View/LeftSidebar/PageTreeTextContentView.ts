import {List} from 'immutable'
import {html} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'

export type PageTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function PageTreeTextContentView(viewModel: PageTreeTextContentViewModel) {
  return html`<div>${DomishObject.toDocumentFragment(viewModel.domishObjects)}</div>`
}
