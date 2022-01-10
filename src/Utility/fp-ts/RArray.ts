import { eqStrict } from 'fp-ts/Eq'
import * as FpNumber from 'fp-ts/number'
import { Option } from 'fp-ts/Option'
import * as Ord from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { assert } from 'src/Utility/Debug/assert'
import { NERArray$, Option$, RArray } from 'src/Utility/fp-ts'
import { Arrow } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'

export * from 'fp-ts/ReadonlyArray'

/**
 * 先頭の要素を削除する。
 * 空の配列に対しては何もしない。
 */
export const shift = <A>(rarray: RArray<A>): RArray<A> => {
  const cloned = rarray.slice()
  cloned.shift()
  return cloned
}

/**
 * 末尾の要素を削除する。
 * 空の配列に対しては何もしない。
 */
export const pop = <A>(rarray: RArray<A>): RArray<A> => {
  const cloned = rarray.slice()
  cloned.pop()
  return cloned
}

/** 指定された値と等しい要素を全て削除する */
export const remove = <A>(value: A) => RA.filter((a: A) => a !== value)

export const removeAt =
  (index: integer) =>
  <A>(rarray: RArray<A>): RArray<A> =>
    RA.unsafeDeleteAt(index, rarray)

export const insertAt =
  <A>(index: integer, value: A) =>
  (rarray: RArray<A>): RArray<A> =>
    RA.unsafeInsertAt(index, value, rarray)

export const insertAll =
  <A>(index: integer, newRarray: RArray<A>) =>
  (rarray: RArray<A>): RArray<A> => {
    const cloned = rarray.slice()
    cloned.splice(index, 0, ...newRarray)
    return cloned
  }

export const updateAt =
  <A>(index: integer, value: A) =>
  (rarray: RArray<A>): RArray<A> =>
    RA.unsafeUpdateAt(index, value, rarray)

export const lastOrThrow = <A>(rarray: RArray<A>): A => {
  assert(rarray.length > 0)
  return rarray[rarray.length - 1]
}

export const max = (rarray: RArray<number>): Option<number> =>
  Option$.map(RNEA.max(FpNumber.Ord))(RNEA.fromReadonlyArray(rarray))

export const min = (rarray: RArray<number>): Option<number> =>
  Option$.map(RNEA.min(FpNumber.Ord))(RNEA.fromReadonlyArray(rarray))

export const flatMap =
  <A, B>(f: Arrow<A, RArray<B>>) =>
  (rarray: RArray<A>): RArray<B> =>
    rarray.flatMap(f)

export const filterUndefined = <A>(rarray: RArray<A | undefined>): RArray<A> =>
  RA.filter((element: A | undefined) => element !== undefined)(rarray) as RArray<A>

/**
 * 配列の要素からnumber値を計算し、その値が最大になる要素を返す。
 * 空配列の場合はnoneを返す。
 */
export const maxBy =
  <A>(toNumber: Arrow<A, number>) =>
  (rarray: RArray<A>): Option<A> => {
    const ord = Ord.contramap(toNumber)(FpNumber.Ord)
    return Option$.map(RNEA.max(ord))(RNEA.fromReadonlyArray(rarray))
  }

/** 配列の要素から計算した値をstring型に変換し、その昇順でソートする */
export const sortBy =
  <A>(f: Arrow<A, any>) =>
  (rarray: RArray<A>): RArray<A> => {
    const cloned = rarray.slice()
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
  (rarray: RArray<A>): RArray<A> => {
    const cloned = rarray.slice()
    cloned.sort((a, b) => {
      return toNumber(a) - toNumber(b)
    })
    return cloned
  }

export const groupBy = NERArray$.groupBy

export const from = <A>(iterable: Iterable<A>): RArray<A> => [...iterable]

/**
 * 指定された値を配列の全要素の間に挿入する。
 * @example
 * interpose(9, [1, 2, 3]) === [1, 9, 2, 9, 3]
 * interpose(9, [1]) === [1]
 * interpose(9, []) === []
 */
export const interpose =
  <A>(delimiter: A) =>
  (rarray: RArray<A>) => {
    const result: A[] = []
    for (let i = 0; i < rarray.length; i++) {
      result.push(rarray[i])
      if (i !== rarray.length - 1) {
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
export const shallowEqual = <A>(rarray1: RArray<A>, rarray2: RArray<A>): boolean =>
  RA.getEq<A>(eqStrict).equals(rarray1, rarray2)
