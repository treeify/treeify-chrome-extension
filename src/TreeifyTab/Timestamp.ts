import {integer} from 'src/Common/integer'

/**
 * いわゆるUnix time（ミリ秒）。
 * number型の精度で問題ないことを確認済み。
 * 具体的には西暦30512年まで問題なく扱える（Number.MAX_SAFE_INTEGERの下4桁を削ってUNIX時間→日付に変換した）。
 */
export type Timestamp = integer

export namespace Timestamp {
  export function now(): Timestamp {
    return Date.now()
  }
}
