import {ItemId, ItemType} from 'src/Common/basicType'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  PageTreeTextContentView,
  PageTreeTextContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeTextContentView'
import {
  PageTreeWebPageContentView,
  PageTreeWebPageContentViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeWebPageContentView'

export type PageTreeContentViewModel =
  | PageTreeTextContentViewModel
  | PageTreeWebPageContentViewModel

export function createPageTreeContentViewModel(
  state: State,
  itemId: ItemId
): PageTreeContentViewModel {
  switch (state.items[itemId].itemType) {
    case ItemType.TEXT:
      return {
        itemType: ItemType.TEXT,
        domishObjects: state.textItems[itemId].domishObjects,
      }
    case ItemType.WEB_PAGE:
      return {
        itemType: ItemType.WEB_PAGE,
      }
  }
}

export function PageTreeContentView(viewModel: PageTreeContentViewModel) {
  switch (viewModel.itemType) {
    case ItemType.TEXT:
      return PageTreeTextContentView(viewModel)
    case ItemType.WEB_PAGE:
      return PageTreeWebPageContentView(viewModel)
  }
}
