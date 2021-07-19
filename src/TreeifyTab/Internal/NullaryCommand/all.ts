import {
  copyForTransclusion,
  pasteAsPlainText,
} from 'src/TreeifyTab/Internal/NullaryCommand/clipboard'
import {
  edit,
  showCitationSettingDialog,
  showOtherParentsDialog,
  showSearchDialog,
  showWorkspaceDialog,
} from 'src/TreeifyTab/Internal/NullaryCommand/dialog'
import {
  collapseItem,
  deleteItem,
  deleteItemItself,
  enterKeyDefault,
  removeEdge,
  toggleCitation,
  toggleCollapsed,
  toggleDoubtful,
  toggleGrayedOut,
  toggleHighlighted,
} from 'src/TreeifyTab/Internal/NullaryCommand/item'
import {
  indentItem,
  moveItemDownward,
  moveItemToNextSibling,
  moveItemToPrevSibling,
  moveItemUpward,
  unindentItem,
} from 'src/TreeifyTab/Internal/NullaryCommand/itemMove'
import {
  createEmptyCodeBlockItem,
  createEmptyTexItem,
} from 'src/TreeifyTab/Internal/NullaryCommand/minorItemType'
import {
  saveToDataFolder,
  selectAll,
  selectAllAboveItems,
  selectAllBelowItems,
  toggleExcluded,
} from 'src/TreeifyTab/Internal/NullaryCommand/other'
import {
  showPage,
  togglePaged,
  turnIntoAndShowPage,
  turnIntoNonPageAndExpand,
} from 'src/TreeifyTab/Internal/NullaryCommand/page'
import {
  createEmptyTextItem,
  groupingItems,
  insertLineBreak,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleUnderline,
} from 'src/TreeifyTab/Internal/NullaryCommand/textItem'
import {
  hardUnloadItem,
  hardUnloadSubtree,
  loadItem,
  loadSubtree,
} from 'src/TreeifyTab/Internal/NullaryCommand/webPageItem'

export * from 'src/TreeifyTab/Internal/NullaryCommand/item'
export * from 'src/TreeifyTab/Internal/NullaryCommand/itemMove'
export * from 'src/TreeifyTab/Internal/NullaryCommand/textItem'
export * from 'src/TreeifyTab/Internal/NullaryCommand/webPageItem'
export * from 'src/TreeifyTab/Internal/NullaryCommand/minorItemType'
export * from 'src/TreeifyTab/Internal/NullaryCommand/page'
export * from 'src/TreeifyTab/Internal/NullaryCommand/dialog'
export * from 'src/TreeifyTab/Internal/NullaryCommand/clipboard'
export * from 'src/TreeifyTab/Internal/NullaryCommand/other'

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
  pasteAsPlainText,
  toggleExcluded,
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
  toggleCitation,
  groupingItems,
  hardUnloadItem,
  hardUnloadSubtree,
  loadItem,
  loadSubtree,
  createEmptyCodeBlockItem,
  createEmptyTexItem,
  createEmptyTextItem,
  edit,
  showWorkspaceDialog,
  showOtherParentsDialog,
  showSearchDialog,
  showCitationSettingDialog,
  saveToDataFolder,
}
