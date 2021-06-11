import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Readable} from 'svelte/store'

export type ItemTreeNodeProps = {
  itemPath: ItemPath
  isActivePage: boolean
  /**
   * このアイテムが選択されているかどうかを示す値。
   * 複数選択されたアイテムのうちの1つならmulti。
   * 単一選択されたアイテムならsingle。
   * 選択されていないならnon。
   */
  selected: 'single' | 'multi' | 'non'
  isTranscluded: boolean
  cssClasses: Readable<List<string>>
  footprintRank: integer | undefined
  footprintRankMap: Map<ItemId, integer>
  footprintCount: integer
  hiddenTabsCount: integer
  childItemPaths: List<ItemPath>
  onMouseDownContentArea: (event: MouseEvent) => void
  onClickDeleteButton: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
  onClickHiddenTabsCount: (event: MouseEvent) => void
}
