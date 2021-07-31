import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'

export type MainAreaImageContentProps = {
  itemPath: ItemPath
  type: ItemType.IMAGE
  url: string
  caption: string
  width: string
  aspectRatio: string
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaImageContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaImageContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const imageItem = state.imageItems[itemId]
  const originalSize = imageItem.originalSize

  return {
    itemPath,
    type: ItemType.IMAGE,
    url: imageItem.url,
    caption: imageItem.caption,
    width: imageItem.widthPx !== null ? `${Math.max(20, imageItem.widthPx)}px` : 'auto',
    aspectRatio: originalSize !== null ? `${originalSize.widthPx / originalSize.heightPx}` : 'auto',
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
