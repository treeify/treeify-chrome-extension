import {createEmptyCodeBlockItem} from 'src/TreeifyWindow/Internal/NullaryCommand/codeBlockItem'
import {
  edit,
  showDefaultWindowModeSettingDialog,
  showLabelEditDialog,
  showOtherParentsDialog,
  showWorkspaceDialog,
} from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
import {
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
  copyForTransclusion,
  excludeFromCurrentWorkspace,
  saveToDataFolder,
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
} from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'

export * from 'src/TreeifyWindow/Internal/NullaryCommand/item'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/itemMove'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/codeBlockItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/page'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/other'

/**
 * この名前空間で定義される全てのコマンド関数をまとめたオブジェクト。
 * 動的にコマンド名からコマンド関数を得るために用いる。
 */
export const functions: {[name: string]: () => void} = {
  toggleCollapsed,
  indentItem,
  unindentItem,
  moveItemUpward,
  moveItemDownward,
  moveItemToPrevSibling,
  moveItemToNextSibling,
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
  createEmptyCodeBlockItem,
  edit,
  showDefaultWindowModeSettingDialog,
  showWorkspaceDialog,
  showLabelEditDialog,
  showOtherParentsDialog,
  saveToDataFolder,
}
