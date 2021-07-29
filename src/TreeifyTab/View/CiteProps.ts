import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

export type CiteProps = {
  title: string
  url: string
  onMouseDown: (event: MouseEvent) => void
}

export function createCiteProps(itemPath: ItemPath): CiteProps | undefined {
  const itemId = ItemPath.getItemId(itemPath)
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
