import {edit} from 'src/TreeifyWindow/Internal/NullaryCommand/dialog'
import {
  becomeAndShowPage,
  deleteItem,
  deleteItemItself,
  enterKeyDefault,
  indentItem,
  moveItemDownward,
  moveItemUpward,
  selectAllAboveItems,
  selectAllBelowItems,
  showPage,
  toggleFolded,
  toggleGrayedOut,
  toggleHighlighted,
  togglePaged,
  unindentItem,
} from 'src/TreeifyWindow/Internal/NullaryCommand/item'
import {openDataFolderPicker} from 'src/TreeifyWindow/Internal/NullaryCommand/other'
import {
  insertLineBreak,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleUnderline,
} from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
import {
  loadItem,
  loadSubtree,
  unloadItem,
  unloadSubtree,
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
  toggleFolded,
  indentItem,
  unindentItem,
  moveItemUpward,
  moveItemDownward,
  selectAllBelowItems,
  selectAllAboveItems,
  enterKeyDefault,
  deleteItem,
  deleteItemItself,
  insertLineBreak,
  togglePaged,
  showPage,
  becomeAndShowPage,
  toggleGrayedOut,
  toggleHighlighted,
  toggleBold,
  toggleUnderline,
  toggleItalic,
  toggleStrikethrough,
  unloadItem,
  unloadSubtree,
  loadItem,
  loadSubtree,
  edit,
  openDataFolderDialog: openDataFolderPicker,
}
export {insertLineBreak} from 'src/TreeifyWindow/Internal/NullaryCommand/textItem'
