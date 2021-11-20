import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import {
  createTexItemContentProps,
  TexItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

export type MainAreaTexContentProps = {
  itemPath: ItemPath
  contentProps: TexItemContentProps
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaTexContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  return {
    itemPath,
    type: 'MainAreaTexContentProps',
    contentProps: createTexItemContentProps(ItemPath.getItemId(itemPath)),
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
