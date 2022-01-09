import { eqStrict } from 'fp-ts/Eq'
import * as FpNumber from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { assert } from 'src/Utility/Debug/assert'
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

/**
 * 末尾の要素を削除する。
 * 空の配列に対しては何もしない。
 */
export const pop = <A>(rist: T<A>): T<A> => {
  const cloned = rist.slice()
  cloned.pop()
  return cloned
}

/** 指定された値と等しい要素を全て削除する */
export const remove = <A>(value: A) => RA.filter((a: A) => a !== value)

export const removeAt =
  (index: integer) =>
  <A>(rist: T<A>): T<A> =>
    RA.unsafeDeleteAt(index, rist)

export const insertAt =
  <A>(index: integer, value: A) =>
  (rist: T<A>): T<A> =>
    RA.unsafeInsertAt(index, value, rist)

export const insertAll =
  <A>(index: integer, newRist: T<A>) =>
  (rist: T<A>): T<A> => {
    const cloned = rist.slice()
    cloned.splice(index, 0, ...newRist)
    return cloned
  }

export const updateAt =
  <A>(index: integer, value: A) =>
  (rist: T<A>): T<A> =>
    RA.unsafeUpdateAt(index, value, rist)

export const lastOrThrow = <A>(rist: T<A>) => {
  assert(rist.length > 0)
  return rist[rist.length - 1]
}

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

export const from = <A>(iterable: Iterable<A>): T<A> => [...iterable]

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

/**
 * 全要素を === で比較する。
 * @example
 * shallowEquals([1, 2], [1, 2]) === true
 * shallowEquals([1, [2]], [1, [2]]) === false
 * shallowEquals([{}], [{}]) === false
 */
export const shallowEqual = <A>(rist1: T<A>, rist2: T<A>) =>
  RA.getEq<A>(eqStrict).equals(rist1, rist2)
