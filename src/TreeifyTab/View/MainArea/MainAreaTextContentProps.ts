import {is, List} from 'immutable'
import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyTab/External/domTextSelection'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'

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
