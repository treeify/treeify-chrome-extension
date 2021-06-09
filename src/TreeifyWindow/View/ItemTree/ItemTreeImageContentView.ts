import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement, createImgElement} from 'src/TreeifyWindow/View/createElement'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'
import {get} from 'svelte/store'

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
    url: get(imageItem.url),
    caption: get(imageItem.caption),
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
