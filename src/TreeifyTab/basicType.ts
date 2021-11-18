import { integer } from 'src/Common/integer'
import { Timestamp } from 'src/TreeifyTab/Timestamp'

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
 */
export const TOP_ITEM_ID = 0

export enum ItemType {
  TEXT = 'Text',
  WEB_PAGE = 'Web page',
  IMAGE = 'Image',
  CODE_BLOCK = 'Code block',
  TEX = 'TeX',
}

/**
 * chrome.tabs.Tab型のidプロパティ用の型。
 * 可読性のために導入。
 */
export type TabId = integer

export type WorkspaceId = Timestamp

export type CommandId = string
