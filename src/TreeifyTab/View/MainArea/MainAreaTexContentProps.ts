import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {
  createTexItemContentProps,
  TexItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'

export type MainAreaTexContentProps = {
  itemPath: ItemPath
  type: ItemType.TEX
  contentProps: TexItemContentProps
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
    contentProps: createTexItemContentProps(itemId),
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
