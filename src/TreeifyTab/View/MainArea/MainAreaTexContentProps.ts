import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { createTexItemContentProps } from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type MainAreaTexContentProps = {
  itemPath: ItemPath
  contentProps: ItemContentProps
  sourceProps: SourceProps | undefined
  onFocus(event: FocusEvent): void
}

export function createMainAreaTexContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  return {
    itemPath,
    type: 'MainAreaTexContentProps',
    contentProps: createTexItemContentProps(ItemPath.getItemId(itemPath)),
    sourceProps: createSourceProps(ItemPath.getItemId(itemPath)),
    onFocus(event) {
      // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
      if (event.target instanceof Node) {
        getSelection()?.setPosition(event.target)
      }
    },
  }
}
