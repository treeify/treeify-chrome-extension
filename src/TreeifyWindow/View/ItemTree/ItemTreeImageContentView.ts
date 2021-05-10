import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'

export type ItemTreeImageContentViewModel = {
  itemPath: ItemPath
  labels: List<string>
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
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.IMAGE,
    url: imageItem.url,
    caption: imageItem.caption,
    onFocus: (event) => {
      doWithErrorCapture(() => {
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
    ${!viewModel.labels.isEmpty()
      ? html`<div class="item-tree-image-content_labels">
          ${viewModel.labels.map((label) => LabelView({text: label}))}
        </div>`
      : undefined}
    <div class="item-tree-image-content_image-and-caption">
      <img class="item-tree-image-content_image" src=${viewModel.url} alt="" />
      <div class="item-tree-image-content_caption">${viewModel.caption}</div>
    </div>
  </div>`
}

export const ItemTreeImageContentCss = css`
  /* 画像アイテムのコンテンツ領域のルート */
  .item-tree-image-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* 画像とキャプションを中央揃えにする */
  .item-tree-image-content_image-and-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* これを指定しないとアイテムツリーの横幅に対する中央揃えになる。それはそれでありだがデフォルトは左寄せにする */
    width: fit-content;
  }

  .item-tree-image-content_image {
    /* 画像が表示領域の横幅をはみ出さないよう設定 */
    max-width: 100%;
    height: auto;
  }
  /* グレーアウト状態の画像 */
  .grayed-out .item-tree-image-content_image {
    filter: opacity(50%);
  }

  /* グレーアウト状態のキャプション */
  .grayed-out .item-tree-image-content_caption {
    color: hsl(0, 0%, 50%);
  }
`
