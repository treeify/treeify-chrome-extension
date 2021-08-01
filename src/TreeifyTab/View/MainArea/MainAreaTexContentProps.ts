import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'

export type MainAreaTexContentProps = {
  itemPath: ItemPath
  type: ItemType.TEX
  code: string
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaTexContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaTexContentProps {
  const itemId = ItemPath.getItemId(itemPath)

  const texItem = state.texItems[itemId]
  return {
    itemPath,
    type: ItemType.TEX,
    code: texItem.code,
    citeProps: createCiteProps(itemId),
    onFocus: (event) => {
      doWithErrorCapture(() => {
        // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
        if (event.target instanceof Node) {
          getSelection()?.setPosition(event.target)
        }
      })
    },
  }
}
