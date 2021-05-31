import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement, createImgElement} from 'src/TreeifyWindow/View/createElement'
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
  onClick: (event: Event) => void
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
        // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
        if (event.target instanceof Node) {
          getSelection()?.setPosition(event.target)
        }
      })
    },
    onClick: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

/** 画像アイテムのコンテンツ領域のView */
export function ItemTreeImageContentView(viewModel: ItemTreeImageContentViewModel) {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return createDivElement(
    {class: 'item-tree-image-content', id, tabindex: '0'},
    {focus: viewModel.onFocus, click: viewModel.onClick},
    [
      !viewModel.labels.isEmpty()
        ? createDivElement(
            'item-tree-image-content_labels',
            {},
            viewModel.labels.map((label) => LabelView({text: label}))
          )
        : undefined,
      createDivElement('item-tree-image-content_image-and-caption', {}, [
        createImgElement({
          class: 'item-tree-image-content_image',
          src: viewModel.url,
          draggable: 'false',
        }),
        createDivElement('item-tree-image-content_caption', {}, [
          document.createTextNode(viewModel.caption),
        ]),
      ]),
    ]
  )
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
