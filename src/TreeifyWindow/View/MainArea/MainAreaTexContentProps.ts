import {is, List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {CiteProps, createCiteProps} from 'src/TreeifyWindow/View/CiteProps'

export type MainAreaTexContentProps = {
  itemPath: ItemPath
  labels: List<string>
  itemType: ItemType.TEX
  code: string
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
  onClick: (event: MouseEvent) => void
}

export function createMainAreaTexContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaTexContentProps {
  const itemId = ItemPath.getItemId(itemPath)

  const texItem = state.texItems[itemId]
  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.TEX,
    code: texItem.code,
    citeProps: createCiteProps(itemPath),
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
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()
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
