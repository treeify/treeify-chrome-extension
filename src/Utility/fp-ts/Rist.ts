import * as FpNumber from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { Option } from 'src/Utility/fp-ts'
import { Arrow } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'

export * from 'fp-ts/ReadonlyArray'

export type T<A> = readonly A[]

/**
 * 先頭の要素を削除する。
 * 空の配列に対しては何もしない。
 */
export const shift = <A>(rist: T<A>): T<A> => {
  const cloned = rist.slice()
  cloned.shift()
  return cloned
}

export const removeAt =
  <A>(index: integer) =>
  (rist: T<A>): T<A> =>
    RA.unsafeDeleteAt(index, rist)

export function max(rist: T<number>): Option.T<number> {
  return Option.map(RNEA.max(FpNumber.Ord))(RNEA.fromReadonlyArray(rist))
}

export const filterUndefined = <A>(rist: T<A | undefined>): T<A> =>
  RA.filter((element: A | undefined) => element !== undefined)(rist) as T<A>

/**
 * 配列の要素からnumber値を計算し、その値が最大になる要素を返す。
 * 空配列の場合はnoneを返す。
 */
export const maxBy =
  <A>(toNumber: Arrow<A, number>) =>
  (rist: T<A>): Option.T<A> => {
    const ord = Ord.contramap(toNumber)(FpNumber.Ord)
    return Option.map(RNEA.max(ord))(RNEA.fromReadonlyArray(rist))
  }

/** 配列の要素から計算した値をstring型に変換し、その昇順でソートする */
export const sortBy =
  <A>(f: Arrow<A, any>) =>
  (rist: T<A>): T<A> => {
    const cloned = rist.slice()
    cloned.sort((a, b) => {
      return String(f(a)).localeCompare(String(f(b)))
    })
    return cloned
  }

/**
 * 配列の要素から計算したnumber値の昇順でソートする。
 * @example
 * sortByNumber((text: string) => text.length)(["width", "height", "x"])
 * ↓
 * ["x","width","height"]
 */
export const sortByNumber =
  <A>(toNumber: Arrow<A, number>) =>
  (rist: T<A>): T<A> => {
    const cloned = rist.slice()
    cloned.sort((a, b) => {
      return toNumber(a) - toNumber(b)
    })
    return cloned
  }

/**
 * TODO: カリー化する
 */
export function join<A>(rist: T<A>, delimiter: A): T<A> {
  const result: A[] = []
  for (let i = 0; i < rist.length; i++) {
    result.push(rist[i])
    if (i !== rist.length - 1) {
      result.push(delimiter)
    }
  }
  return result
}
