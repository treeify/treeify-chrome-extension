import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type MainAreaImageContentProps = {
  itemPath: ItemPath
  url: string
  caption: string
  width: string
  aspectRatio: string
  sourceProps: SourceProps | undefined
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaImageContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const imageItem = state.imageItems[itemId]
  const originalSize = imageItem.originalSize
  const widthPx = imageItem.widthPx ?? originalSize?.widthPx

  return {
    itemPath,
    type: 'MainAreaImageContentProps',
    url: imageItem.url,
    caption: imageItem.caption,
    width: widthPx !== undefined ? `${widthPx}px` : 'max-content',
    aspectRatio: originalSize !== null ? `${originalSize.widthPx / originalSize.heightPx}` : 'auto',
    sourceProps: createSourceProps(itemId),
    onFocus: (event) => {
      // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
      if (event.target instanceof Node) {
        getSelection()?.setPosition(event.target)
      }
    },
  }
}
