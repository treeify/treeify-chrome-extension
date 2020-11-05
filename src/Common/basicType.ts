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

export enum ItemType {
  TEXT = 'Text',
  WEB_PAGE = 'Web page',
}

/**
 * Chromeの本来のタブID（chrome.tabs.Tab型のidプロパティ）はブラウザ再起動やタブのdiscardで変化してしまう。
 * そこで、代わりに独自のタブIDを用いてタブを識別する。
 */
export type StableTabId = integer
