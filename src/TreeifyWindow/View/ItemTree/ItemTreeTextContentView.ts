import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {External} from 'src/TreeifyWindow/External/External'
import {doWithErrorHandling} from 'src/Common/Debug/report'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
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
    itemType: ItemType.TEXT,
    domishObjects: state.textItems[itemId].domishObjects,
    onInput: (event) => {
      doWithErrorHandling(() => {
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
      doWithErrorHandling(() => {
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
      doWithErrorHandling(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

/**
 * テキストアイテムのコンテンツ領域のView
 * contenteditableな要素はlit-htmlで描画するのが事実上困難なので、
 * 独自のDOM要素キャッシュを用いている点に注意。
 */
export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel): TemplateResult {
  return html`<div class="item-tree-text-content">${getContentEditableElement(viewModel)}</div>`
}

function getContentEditableElement(viewModel: ItemTreeTextContentViewModel): HTMLElement {
  // キャッシュ照会
  const cached = External.instance.textItemDomElementCache.get(
    viewModel.itemPath,
    viewModel.domishObjects
  )
  if (cached !== undefined) return cached

  // contenteditableな要素のinnerHTMLは原則としてlit-htmlで描画するべきでないので自前でDOM要素を作る。
  // 参考：https://github.com/Polymer/lit-html/issues/572
  const contentEditableElement = document.createElement('div')
  contentEditableElement.id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  contentEditableElement.className = 'item-tree-text-content_content-editable'
  contentEditableElement.setAttribute('contenteditable', 'true')
  contentEditableElement.appendChild(DomishObject.toDocumentFragment(viewModel.domishObjects))
  contentEditableElement.addEventListener('input', viewModel.onInput as any)
  contentEditableElement.addEventListener('compositionend', viewModel.onCompositionEnd as any)
  contentEditableElement.addEventListener('focus', viewModel.onFocus as any)

  // キャッシュに登録
  External.instance.textItemDomElementCache.set(
    viewModel.itemPath,
    viewModel.domishObjects,
    contentEditableElement
  )

  return contentEditableElement
}
