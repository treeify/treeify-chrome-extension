import {
  deleteItem,
  enterKeyDefault,
  indentItem,
  insertLineBreak,
  moveItemDownward,
  moveItemUpward,
  toggleFolded,
  togglePaged,
  unindentItem,
} from 'src/TreeifyWindow/Model/NullaryCommand/item'

export * from 'src/TreeifyWindow/Model/NullaryCommand/item'

/**
 * この名前空間で定義される全てのコマンド関数をまとめたオブジェクト。
 * コマンド名からコマンド関数を得るために用いる。
 */
export const functions: {[name: string]: () => void} = {
  toggleFolded,
  indentItem,
  unindentItem,
  moveItemUpward,
  moveItemDownward,
  enterKeyDefault,
  deleteItem,
  insertLineBreak,
  togglePaged,
}
