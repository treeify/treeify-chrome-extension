import { integer } from 'src/Utility/integer'
import { Timestamp } from 'src/Utility/Timestamp'

/**
 * 項目IDの型エイリアス。
 * 将来的にstring型に変わる可能性が0ではないし、
 * そうでなくとも可読性のために型エイリアスを使う。
 * 先頭文字が大文字になっている理由はitemIdという変数名を使いたいから。
 */
export type ItemId = integer

/**
 * トップページの項目ID。
 * この項目は下記の特徴を持つ。
 * ・インストール時に自動生成される
 * ・削除されない
 * ・常に親を持たない
 * ・常にページである（非ページ化できない）
 * ・常にマウントされている
 * ・除外できない
 */
export const TOP_ITEM_ID = 0

export enum ItemType {
  TEXT = 'Text',
  WEB_PAGE = 'Web page',
  IMAGE = 'Image',
  CODE_BLOCK = 'Code block',
  TEX = 'TeX',
}

export const allItemTypes = [
  ItemType.TEXT,
  ItemType.WEB_PAGE,
  ItemType.IMAGE,
  ItemType.CODE_BLOCK,
  ItemType.TEX,
] as const

export const itemTypeDisplayNames = {
  [ItemType.TEXT]: 'テキスト',
  [ItemType.WEB_PAGE]: 'ウェブページ',
  [ItemType.IMAGE]: '画像',
  [ItemType.CODE_BLOCK]: 'コードブロック',
  [ItemType.TEX]: 'TeX',
} as const

export type WorkspaceId = Timestamp
