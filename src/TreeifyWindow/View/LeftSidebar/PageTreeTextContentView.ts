import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'

export type PageTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
}

export function PageTreeTextContentView(viewModel: PageTreeTextContentViewModel) {
  return createDivElement({}, {}, [DomishObject.toDocumentFragment(viewModel.domishObjects)])
}
