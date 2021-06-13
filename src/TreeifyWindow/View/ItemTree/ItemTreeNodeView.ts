import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Readable} from 'svelte/store'

export type ItemTreeNodeProps = {
  itemPath: ItemPath
  isActivePage: boolean
  isSelected: Readable<boolean>
  isMultiSelected: Readable<boolean>
  isTranscluded: boolean
  cssClasses: Readable<List<string>>
  footprintRank: integer | undefined
  footprintRankMap: Map<ItemId, integer>
  footprintCount: integer
  hiddenTabsCount: integer
  childItemPaths: Readable<List<ItemPath>>
  onMouseDownContentArea: (event: MouseEvent) => void
  onClickDeleteButton: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
  onClickHiddenTabsCount: (event: MouseEvent) => void
}
