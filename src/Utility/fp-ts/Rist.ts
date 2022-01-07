import * as FpNumber from 'fp-ts/number'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { Option } from 'src/Utility/fp-ts'

export * from 'fp-ts/ReadonlyArray'

export type T<A> = readonly A[]

export function max(array: T<number>): Option.T<number> {
  return Option.map(RNEA.max(FpNumber.Ord))(RNEA.fromReadonlyArray(array))
}
