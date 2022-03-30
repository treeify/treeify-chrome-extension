import { RArray, RRecord } from 'src/Utility/fp-ts/index'

export * from 'fp-ts/ReadonlyRecord'

/** Object.entries関数の型を詳細化しただけのユーティリティ関数 */
export function entries<T extends string, V>(record: RRecord<T, V>): RArray<[T, V]> {
  return Object.entries(record) as any
}

/** Object.keys関数の型を詳細化しただけのユーティリティ関数 */
export function keys<T extends string, V>(record: RRecord<T, V>): RArray<T> {
  return Object.keys(record) as any
}

/** Object.keysで取得した文字列をNumber()で変換する */
export function numberKeys<T extends number, V>(record: Record<T, V>): RArray<T> {
  return Object.keys(record).map(Number) as any
}

/** Object.fromEntries関数の型を詳細化しただけのユーティリティ関数 */
export function fromEntries<T extends string, V>(
  iterable: Iterable<readonly [T, V]>
): RRecord<T, V> {
  return Object.fromEntries(iterable) as any
}
