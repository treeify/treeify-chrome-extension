import {integer} from 'src/Common/integer'
import {External} from 'src/TreeifyTab/External/External'
import {itemDragData, ItemDragData} from 'src/TreeifyTab/View/dragAndDrop'

export type DragImageProps = {
  mousePosition: {x: integer; y: integer}
  itemDragData: ItemDragData
}

export function createDragImageProps(): DragImageProps | undefined {
  if (itemDragData === undefined || External.instance.mousePosition === undefined) return undefined

  return {
    mousePosition: External.instance.mousePosition,
    itemDragData: itemDragData,
  }
}
