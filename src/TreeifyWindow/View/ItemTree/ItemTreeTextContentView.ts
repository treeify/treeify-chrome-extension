import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
  labels: List<string>
  domishObjects: List<DomishObject>
  onInput: (event: Event) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onClick: (event: Event) => void
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
    onInput: (event: Event) => {
      doWithErrorCapture(() => {
        if (event instanceof InputEvent && !event.isComposing && event.target instanceof Node) {
          Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)

          CurrentState.updateItemTimestamp(itemId)
          Rerenderer.instance.rerender()
        }
      })
    },
    onCompositionEnd: (event) => {
      doWithErrorCapture(() => {
        if (event.target instanceof Node) {
          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)
          Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
          CurrentState.updateItemTimestamp(itemId)
          Rerenderer.instance.rerender()
        }
      })
    },
    onClick: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)

        // 再描画によってDOM要素が再生成され、キャレット位置がリセットされるので上書きするよう設定する
        Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

        Rerenderer.instance.rerender()
      })
    },
  }
}
