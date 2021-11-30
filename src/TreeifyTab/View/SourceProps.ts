import { ItemId } from 'src/TreeifyTab/basicType'
import { Internal } from 'src/TreeifyTab/Internal/Internal'

export type SourceProps = {
  title: string
  url: string
  onMouseDown: (event: MouseEvent) => void
}

export function createSourceProps(itemId: ItemId): SourceProps | undefined {
  const source = Internal.instance.state.items[itemId].source
  if (source === null) return undefined

  return {
    title: source.title,
    url: source.url,
    onMouseDown: (event: MouseEvent) => {
      // 中クリックで項目が削除されたりする問題への対策
      event.stopPropagation()
    },
  }
}
