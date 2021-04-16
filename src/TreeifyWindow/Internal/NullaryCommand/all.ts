import {createEmptyCodeBlockItem} from 'src/TreeifyWindow/Internal/NullaryCommand/codeBlockItem'
import {edit} from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
import {
  deleteItem,
  deleteItemItself,
  enterKeyDefault,
  indentItem,
  moveItemDownward,
  moveItemUpward,
  showPage,
  toggleCollapsed,
  toggleGrayedOut,
  toggleHighlighted,
  togglePaged,
  turnIntoAndShowPage,
  turnIntoNonPageAndExpand,
  unindentItem,
} from 'src/TreeifyWindow/Internal/NullaryCommand/item'
import {
  copyForTransclusion,
  saveToDataFolder,
  selectAllAboveItems,
  selectAllBelowItems,
} from 'src/TreeifyWindow/Internal/NullaryCommand/other'
import {
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
} from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'

export * from 'src/TreeifyWindow/Internal/NullaryCommand/item'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
export * from 'src/TreeifyWindow/Internal/NullaryCommand/webPageItem'
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
  selectAllBelowItems,
  selectAllAboveItems,
  copyForTransclusion,
  enterKeyDefault,
  deleteItem,
  deleteItemItself,
  insertLineBreak,
  togglePaged,
  showPage,
  turnIntoAndShowPage,
  turnIntoNonPageAndExpand,
  toggleGrayedOut,
  toggleHighlighted,
  toggleBold,
  toggleUnderline,
  toggleItalic,
  toggleStrikethrough,
  hardUnloadItem,
  hardUnloadSubtree,
  loadItem,
  loadSubtree,
  createEmptyCodeBlockItem,
  edit,
  saveToDataFolder,
}
export {insertLineBreak} from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
