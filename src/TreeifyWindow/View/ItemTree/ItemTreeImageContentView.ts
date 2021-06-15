import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type ItemTreeImageContentViewModel = {
  itemPath: ItemPath
  labels: List<string>
  itemType: ItemType.IMAGE
  url: string
  caption: string
  onFocus: (event: FocusEvent) => void
  onClick: (event: Event) => void
}

export function createItemTreeImageContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeImageContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  const imageItem = state.imageItems[itemId]

  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.IMAGE,
    url: imageItem.url,
    caption: imageItem.caption,
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
        CurrentState.setTargetItemPath(itemPath)
        Rerenderer.instance.rerender()
      })
    },
  }
}
