import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
  labels: List<string>
  domishObjects: List<DomishObject>
  onInput: (event: InputEvent) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onFocus: (event: FocusEvent) => void
}

export function createItemTreeTextContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeTextContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.TEXT,
    domishObjects: state.textItems[itemId].domishObjects,
    onInput: (event) => {
      doWithErrorCapture(() => {
        // もしisComposingがtrueの時にModelに反映するとテキストが重複してしまう
        if (!event.isComposing && event.target instanceof Node) {
          // 最新のキャレット位置をModelに反映する
          External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)

          // DOMの内容が変わったので、キャッシュ内のdomishObjectsを更新する。
          // これを怠ると特定の手順でIME入力した際に文字入力がなかったことにされてしまう。
          // 【具体的な手順】
          // (1) Aキーを押して「あ」と入力
          // (2) Spaceキーを押して「亜」に変換（Enterキーは押さない）
          // (3) Kキーを押して、さらにIキーを押す（つまり「亜」の後ろに「き」と入力しようとする）
          // →実際にはKキーの入力がなかったことにされ、「亜い」と表示される。
          External.instance.textItemDomElementCache.updateDomishObjects(itemPath, domishObjects)

          External.instance.requestFocusAfterRendering(
            ItemTreeContentView.focusableDomElementId(itemPath)
          )

          CurrentState.updateItemTimestamp(itemId)
          CurrentState.commit()
        }
      })
    },
    onCompositionEnd: (event) => {
      doWithErrorCapture(() => {
        if (event.target instanceof Node) {
          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)
          External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          // DOMの内容が変わったので、キャッシュ内のdomishObjectsを更新する。
          // これを怠ると特定の手順でIME入力した際に文字入力がなかったことにされてしまう。
          // 【具体的な手順】
          // (1) Aキーを押して「あ」と入力
          // (2) Spaceキーを押して「亜」に変換（Enterキーは押さない）
          // (3) Kキーを押して、さらにIキーを押す（つまり「亜」の後ろに「き」と入力しようとする）
          // →実際にはKキーの入力がなかったことにされ、「亜い」と表示される。
          External.instance.textItemDomElementCache.updateDomishObjects(itemPath, domishObjects)

          External.instance.requestFocusAfterRendering(
            ItemTreeContentView.focusableDomElementId(itemPath)
          )

          CurrentState.updateItemTimestamp(itemId)
          CurrentState.commit()
        }
      })
    },
    onFocus: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel) {
  return createDivElement('item-tree-text-content', {}, [
    !viewModel.labels.isEmpty()
      ? createDivElement(
          'item-tree-text-content_labels',
          {},
          viewModel.labels.map((label) => LabelView({text: label}))
        )
      : undefined,
    getContentEditableElement(viewModel),
  ])
}

function getContentEditableElement(viewModel: ItemTreeTextContentViewModel): HTMLElement {
  // キャッシュ照会
  const cached = External.instance.textItemDomElementCache.get(
    viewModel.itemPath,
    viewModel.domishObjects
  )
  if (cached !== undefined) return cached

  const contentEditableElement = createDivElement(
    {
      id: ItemTreeContentView.focusableDomElementId(viewModel.itemPath),
      class: 'item-tree-text-content_content-editable',
      contenteditable: 'true',
    },
    {
      input: viewModel.onInput,
      compositionend: viewModel.onCompositionEnd,
      focus: viewModel.onFocus,
    },
    [DomishObject.toDocumentFragment(viewModel.domishObjects)]
  )

  // キャッシュに登録
  External.instance.textItemDomElementCache.set(
    viewModel.itemPath,
    viewModel.domishObjects,
    contentEditableElement
  )

  return contentEditableElement
}

export const ItemTreeTextContentCss = css`
  .item-tree-text-content_labels {
    float: left;

    /* テキストとの間に少し余白を入れないとくっつく */
    margin-right: 0.1em;
  }

  /* テキストアイテムのcontenteditableな要素 */
  .item-tree-text-content_content-editable {
    /* contenteditableな要素のフォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のテキストアイテム */
  .grayed-out .item-tree-text-content_content-editable,
  .grayed-out-children .item-tree-text-content_content-editable {
    color: var(--grayed-out-item-text-color);
  }
`
