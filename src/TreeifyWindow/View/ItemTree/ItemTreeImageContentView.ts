import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

export type ItemTreeImageContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.IMAGE
  url: string
  caption: string
  onFocus: (event: FocusEvent) => void
}

export function createItemTreeImageContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeImageContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  const imageItem = state.imageItems[itemId]

  return {
    itemPath,
    itemType: ItemType.IMAGE,
    url: imageItem.url,
    caption: imageItem.caption,
    onFocus: (event) => {
      doWithErrorHandling(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

/** 画像アイテムのコンテンツ領域のView */
export function ItemTreeImageContentView(viewModel: ItemTreeImageContentViewModel): TemplateResult {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return html`<div
    class="item-tree-image-content"
    id=${id}
    tabindex="0"
    @focus=${viewModel.onFocus}
  >
    <div class="item-tree-image-content_image-and-caption">
      <img class="item-tree-image-content_image" src=${viewModel.url} alt="" />
      <div class="item-tree-image-content_caption">${viewModel.caption}</div>
    </div>
  </div>`
}
