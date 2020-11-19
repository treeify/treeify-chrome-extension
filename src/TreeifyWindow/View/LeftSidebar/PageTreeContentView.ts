import {ItemType} from 'src/Common/basicType'
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

export function PageTreeContentView(viewModel: PageTreeContentViewModel) {
  switch (viewModel.itemType) {
    case ItemType.TEXT:
      return PageTreeTextContentView(viewModel)
    case ItemType.WEB_PAGE:
      return PageTreeWebPageContentView(viewModel)
  }
}
