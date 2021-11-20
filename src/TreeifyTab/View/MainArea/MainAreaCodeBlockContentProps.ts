import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import {
  CodeBlockItemContentProps,
  createCodeBlockItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

export type MainAreaCodeBlockContentProps = {
  itemPath: ItemPath
  contentProps: CodeBlockItemContentProps
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaCodeBlockContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  return {
    itemPath,
    type: 'MainAreaCodeBlockContentProps',
    contentProps: createCodeBlockItemContentProps(ItemPath.getItemId(itemPath)),
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
