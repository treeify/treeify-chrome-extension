import {ItemId} from 'src/TreeifyTab/basicType'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

export type CiteProps = {
  title: string
  url: string
  onMouseDown: (event: MouseEvent) => void
}

export function createCiteProps(itemId: ItemId): CiteProps | undefined {
  const cite = Internal.instance.state.items[itemId].cite
  if (cite === null) return undefined

  return {
    title: cite.title,
    url: cite.url,
    onMouseDown: (event: MouseEvent) => {
      // 中クリックで項目が削除されたりする問題への対策
      event.stopPropagation()
    },
  }
}
