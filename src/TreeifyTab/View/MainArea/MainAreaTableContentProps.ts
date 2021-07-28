import {List} from 'immutable'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State, TableView} from 'src/TreeifyTab/Internal/State'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

export type MainAreaTableContentProps = {
  itemPath: ItemPath
  type: TableView['type']
  caption: ItemContentProps
  rows: List<List<ItemContentProps>>
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaTableContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaTableContentProps {
  const itemId = ItemPath.getItemId(itemPath)

  return {
    itemPath,
    type: 'table',
    caption: createItemContentProps(itemId),
    rows: state.items[itemId].childItemIds.map((childItemId) => {
      return state.items[childItemId].childItemIds.map(createItemContentProps)
    }),
    citeProps: createCiteProps(itemPath),
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
