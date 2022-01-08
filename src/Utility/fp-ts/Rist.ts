import * as FpNumber from 'fp-ts/number'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { Option } from 'src/Utility/fp-ts'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/ReadonlyArray'

export type T<A> = readonly A[]

export function max(array: T<number>): Option.T<number> {
  return Option.map(RNEA.max(FpNumber.Ord))(RNEA.fromReadonlyArray(array))
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
