import {
  edit,
  showDefaultWindowModeSettingDialog,
  showLabelEditDialog,
  showOtherParentsDialog,
  showSearchDialog,
  showWorkspaceDialog,
} from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
import {
  collapseItem,
  deleteItem,
  deleteItemItself,
  enterKeyDefault,
  removeEdge,
  toggleCollapsed,
  toggleDoubtful,
  toggleGrayedOut,
  toggleHighlighted,
} from 'src/TreeifyWindow/Internal/NullaryCommand/item'
import {
  indentItem,
  moveItemDownward,
  moveItemToNextSibling,
  moveItemToPrevSibling,
  moveItemUpward,
  unindentItem,
} from 'src/TreeifyWindow/Internal/NullaryCommand/itemMove'
import {
  createEmptyCodeBlockItem,
  createEmptyTexItem,
} from 'src/TreeifyWindow/Internal/NullaryCommand/minorItemType'
import {
  copyForTransclusion,
  excludeFromCurrentWorkspace,
  saveToDataFolder,
  selectAll,
  selectAllAboveItems,
  selectAllBelowItems,
  toDualWindowMode,
} from 'src/TreeifyWindow/Internal/NullaryCommand/other'
import {
  showPage,
  togglePaged,
  turnIntoAndShowPage,
  turnIntoNonPageAndExpand,
} from 'src/TreeifyWindow/Internal/NullaryCommand/page'
import {
  groupingItems,
  insertLineBreak,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleUnderline,
} from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
import {
  hardUnloadItem,
  hardUnloadSubtree,
  loadItem,
  loadSubtree,
  openNewTab,
  toDualWindowModeAndOpenNewTab,
} from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'

export * from 'src/TreeifyWindow/Internal/NullaryCommand/item'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/itemMove'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/minorItemType'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/page'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/other'

/**
 * この名前空間で定義される全てのコマンド関数をまとめたオブジェクト。
 * 動的にコマンド名からコマンド関数を得るために用いる。
 */
export const functions: {[name: string]: () => void} = {
  collapseItem,
  toggleCollapsed,
  indentItem,
  unindentItem,
  moveItemUpward,
  moveItemDownward,
  moveItemToPrevSibling,
  moveItemToNextSibling,
  selectAll,
  selectAllBelowItems,
  selectAllAboveItems,
  copyForTransclusion,
  excludeFromCurrentWorkspace,
  toDualWindowMode,
  enterKeyDefault,
  removeEdge,
  deleteItem,
  deleteItemItself,
  insertLineBreak,
  togglePaged,
  showPage,
  turnIntoAndShowPage,
  turnIntoNonPageAndExpand,
  toggleGrayedOut,
  toggleHighlighted,
  toggleDoubtful,
  toggleBold,
  toggleUnderline,
  toggleItalic,
  toggleStrikethrough,
  groupingItems,
  hardUnloadItem,
  hardUnloadSubtree,
  loadItem,
  loadSubtree,
  openNewTab,
  toDualWindowModeAndOpenNewTab,
  createEmptyCodeBlockItem,
  createEmptyTexItem,
  edit,
  showDefaultWindowModeSettingDialog,
  showWorkspaceDialog,
  showLabelEditDialog,
  showOtherParentsDialog,
  showSearchDialog,
  saveToDataFolder,
}
