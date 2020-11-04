import {TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {assertNeverType} from 'src/Common/Debug/assert'
import {
  ItemTreeWebPageContentView,
  ItemTreeWebPageContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeWebPageContentView'
import {ItemTreeTextContentView, ItemTreeTextContentViewModel} from './ItemTreeTextContentView'

export type ItemTreeContentViewModel =
  | ItemTreeTextContentViewModel
  | ItemTreeWebPageContentViewModel

/** アイテムツリーの各アイテムのコンテンツ領域のViewスイッチャー */
export function ItemTreeContentView(viewModel: ItemTreeContentViewModel): TemplateResult {
  switch (viewModel.itemType) {
    case ItemType.TEXT:
      return ItemTreeTextContentView(viewModel)
    case ItemType.WEB_PAGE:
      return ItemTreeWebPageContentView(viewModel)
    default:
      assertNeverType(viewModel)
  }
}
