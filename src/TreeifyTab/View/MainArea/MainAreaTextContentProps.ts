import { List } from 'immutable'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type MainAreaTextContentProps = {
  itemPath: ItemPath
  domishObjects: List<DomishObject>
  sourceProps: SourceProps | undefined
  onInput: (event: Event) => void
  onCompositionEnd: (event: CompositionEvent) => void
}

export function createMainAreaTextContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  return {
    itemPath,
    type: 'MainAreaTextContentProps',
    domishObjects: state.textItems[itemId].domishObjects,
    sourceProps: createSourceProps(itemId),
    onInput: (event: Event) => {
      if (event instanceof InputEvent && !event.isComposing && event.target instanceof Node) {
        Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

        Internal.instance.saveCurrentStateToUndoStack()

        // contenteditableな要素のinnerHTMLをModelに反映する
        const domishObjects = DomishObject.fromChildren(event.target)
        CurrentState.setTextItemDomishObjects(itemId, domishObjects)

        CurrentState.updateItemTimestamp(itemId)
        Rerenderer.instance.rerender()
      }
    },
    onCompositionEnd: (event) => {
      if (event.target instanceof Node) {
        Internal.instance.saveCurrentStateToUndoStack()

        // contenteditableな要素のinnerHTMLをModelに反映する
        const domishObjects = DomishObject.fromChildren(event.target)
        CurrentState.setTextItemDomishObjects(itemId, domishObjects)
        Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
        CurrentState.updateItemTimestamp(itemId)
        Rerenderer.instance.rerender()
      }
    },
  }
}
