import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {
  ItemTreeContentView,
  ItemTreeContentViewModel,
} from 'src/TreeifyWindow/View/ItemTreeContentView'

export type ItemTreeNodeViewModel = {
  contentViewModel: ItemTreeContentViewModel
  childItemViewModels: List<ItemTreeNodeViewModel>
}

/** アイテムツリーの各アイテムのルートView */
export function ItemTreeNodeView(viewModel: ItemTreeNodeViewModel): TemplateResult {
  // TODO: バレットを表示する
  // TODO: インデントラインを表示する
  return html`<div>
    <!-- コンテンツ領域 -->
    <div>${ItemTreeContentView(viewModel.contentViewModel)}</div>
    <!-- 子リスト -->
    <div>${viewModel.childItemViewModels.map(ItemTreeNodeView)}</div>
  </div>`
}
