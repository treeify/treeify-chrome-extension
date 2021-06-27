import {is, List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {CiteProps, createCiteProps} from 'src/TreeifyWindow/View/CiteProps'

export type MainAreaTextContentProps = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
  labels: List<string>
  domishObjects: List<DomishObject>
  citeProps: CiteProps | undefined
  onInput: (event: Event) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onClick: (event: MouseEvent) => void
}

export function createMainAreaTextContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaTextContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.TEXT,
    domishObjects: state.textItems[itemId].domishObjects,
    citeProps: createCiteProps(itemPath),
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
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            CurrentState.setTargetItemPath(itemPath)

            // 再描画によってDOM要素が再生成され、キャレット位置がリセットされるので上書きするよう設定する
            Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

            Rerenderer.instance.rerender()
            break
          case '0100MouseButton0':
            event.preventDefault()
            if (is(itemPath.pop(), CurrentState.getTargetItemPath().pop())) {
              CurrentState.setTargetItemPathOnly(itemPath)
              Rerenderer.instance.rerender()
            }
            break
        }
      })
    },
  }
}
