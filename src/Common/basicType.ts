/**
 * 整数を表す型。
 * 実体は単なるnumber型なので整数であることを保証できないが、integer型の値は整数だと仮定していい。
 * （そう仮定して問題ないように注意深くコーディングする）
 */
export type integer = number

/**
 * アイテムIDの型エイリアス。
 * 将来的にstring型に変わる可能性が0ではないし、
 * そうでなくとも可読性のために型エイリアスを使う。
 * 先頭文字が大文字になっている理由はitemIdという変数名を使いたいから。
 */
export type ItemId = integer

/**
 * トップページのアイテムID。
 * このアイテムは下記の特徴を持つ。
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
}

/**
 * chrome.tabs.Tab型のidプロパティを表す型。
 * 可読性のために導入。
 */
export type TabId = integer

/** WebStormがなぜかchrome.tabs.*のimportをサジェストしてくれないのでその対策 */
export type Tab = chrome.tabs.Tab
