import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { SizePx, State } from 'src/TreeifyTab/Internal/State'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'
import { integer } from 'src/Utility/integer'

export type MainAreaImageContentProps = {
  itemPath: ItemPath
  url: string
  caption: string
  widthPx: integer | null
  originalSize: SizePx | null
  sourceProps: SourceProps | undefined
  onFocus(event: FocusEvent): void
}

export function createMainAreaImageContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const imageItem = state.imageItems[itemId]
  return {
    itemPath,
    type: 'MainAreaImageContentProps',
    url: imageItem.url,
    caption: imageItem.caption,
    widthPx: imageItem.widthPx,
    originalSize: imageItem.originalSize,
    sourceProps: createSourceProps(itemId),
    onFocus(event) {
      // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
      if (event.target instanceof Node) {
        getSelection()?.setPosition(event.target)
      }
    },
  }
}
