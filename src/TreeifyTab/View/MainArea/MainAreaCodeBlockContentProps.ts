import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { createCodeBlockItemContentProps } from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'
import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type MainAreaCodeBlockContentProps = {
  itemPath: ItemPath
  contentProps: ItemContentProps
  sourceProps: SourceProps | undefined
  onFocus(event: FocusEvent): void
}

export function createMainAreaCodeBlockContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  return {
    itemPath,
    type: 'MainAreaCodeBlockContentProps',
    contentProps: createCodeBlockItemContentProps(ItemPath.getItemId(itemPath)),
    sourceProps: createSourceProps(itemPath),
    onFocus(event) {
      // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
      if (event.target instanceof Node) {
        getSelection()?.setPosition(event.target)
      }
    },
  }
}
