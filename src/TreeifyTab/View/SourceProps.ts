import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type SourceProps = {
  title: string
  url: string
  onMouseDown(event: MouseEvent): void
}

export function createSourceProps(itemPath: ItemPath): SourceProps | undefined {
  const itemId = ItemPath.getItemId(itemPath)
  const source = Internal.instance.state.items[itemId].source
  if (source === null) return undefined

  return {
    title: source.title,
    url: source.url,
    onMouseDown(event: MouseEvent) {
      // 中クリックで項目が削除されたりする問題への対策
      event.stopPropagation()

      CurrentState.setTargetItemPath(itemPath)
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.rerender()
    },
  }
}
