import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {External} from 'src/TreeifyWindow/External/External'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
  onInput: (event: InputEvent) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onFocus: (event: FocusEvent) => void
  onBlur: (event: FocusEvent) => void
}

export function createItemTreeTextContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeTextContentViewModel {
  return {
    itemPath,
    itemType: ItemType.TEXT,
    domishObjects: state.textItems[itemPath.itemId].domishObjects,
    onInput: (event) => {
      // もしisComposingがtrueの時にModelに反映するとテキストが重複してしまう
      if (!event.isComposing && event.target instanceof Node) {
        // 最新のキャレット位置をModelに反映する
        NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)

        // contenteditableな要素のinnerHTMLをModelに反映する
        const domishObjects = DomishObject.fromChildren(event.target)
        NextState.setTextItemDomishObjects(itemPath.itemId, domishObjects)

        External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(itemPath))

        NextState.updateItemTimestamp(itemPath.itemId)
        NextState.commit()
      }
    },
    onCompositionEnd: (event) => {
      if (event.target instanceof Node) {
        // contenteditableな要素のinnerHTMLをModelに反映する
        const domishObjects = DomishObject.fromChildren(event.target)
        NextState.setTextItemDomishObjects(itemPath.itemId, domishObjects)
        NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)

        External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(itemPath))

        NextState.updateItemTimestamp(itemPath.itemId)
        NextState.commit()
      }
    },
    onFocus: (event) => {
      NextState.setFocusedItemPath(itemPath)
      NextState.setBlurredItemPath(null)
      NextState.commitSilently()
    },
    onBlur: (event) => {
      NextState.setBlurredItemPath(itemPath)
      NextState.setFocusedItemPath(null)
      NextState.commitSilently()
    },
  }
}

/** テキストアイテムのコンテンツ領域のView */
export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel): TemplateResult {
  // contenteditableな要素のinnerHTMLは原則としてlit-htmlで描画するべきでないので、自前でDOM要素を作る
  const contentEditableElement = document.createElement('div')
  contentEditableElement.id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  contentEditableElement.className = 'item-tree-text-content_content-editable'
  contentEditableElement.setAttribute('contenteditable', 'true')
  contentEditableElement.appendChild(DomishObject.toDocumentFragment(viewModel.domishObjects))
  contentEditableElement.addEventListener('input', viewModel.onInput as any)
  contentEditableElement.addEventListener('compositionend', viewModel.onCompositionEnd as any)
  contentEditableElement.addEventListener('focus', viewModel.onFocus as any)
  contentEditableElement.addEventListener('blur', viewModel.onBlur as any)

  return html`<div class="item-tree-text-content">${contentEditableElement}</div>`
}
