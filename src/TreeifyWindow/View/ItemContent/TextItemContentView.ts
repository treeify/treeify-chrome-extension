import {List} from 'immutable'
import {html} from 'lit-html'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

export type TextItemContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function createTextItemContentViewModel(itemId: ItemId): TextItemContentViewModel {
  return {
    itemType: ItemType.TEXT,
    domishObjects: Internal.instance.state.textItems[itemId].domishObjects,
  }
}

export function TextItemContentView(viewModel: TextItemContentViewModel) {
  return html`<div>${DomishObject.toDocumentFragment(viewModel.domishObjects)}</div>`
}
