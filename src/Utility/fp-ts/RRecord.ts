import { RArray, RRecord } from 'src/Utility/fp-ts/index'

export * from 'fp-ts/ReadonlyRecord'

/** Object.entries関数の型をRRecord用に詳細化しただけのユーティリティ関数 */
export function toEntries<T extends string, V>(record: RRecord<T, V>): RArray<[T, V]> {
  return Object.entries(record) as any
}
