import { eqStrict } from 'fp-ts/Eq'
import * as FpReadonlySet from 'fp-ts/ReadonlySet'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/ReadonlySet'

export type T<A> = ReadonlySet<A>

export const remove = <A>(value: A) => FpReadonlySet.remove<A>(eqStrict)(value)

export const union = <A>(rset1: T<A>, rset2: T<A>) => FpReadonlySet.union<A>(eqStrict)(rset1, rset2)
export const intersection = <A>(rset1: T<A>, rset2: T<A>) =>
  FpReadonlySet.intersection<A>(eqStrict)(rset1, rset2)
export const difference = <A>(rset1: T<A>, rset2: T<A>) =>
  FpReadonlySet.difference<A>(eqStrict)(rset1, rset2)

export const map = <A, B>(f: Arrow<A, B>) => FpReadonlySet.map<B>(eqStrict)(f)

export const flatMap =
  <A, B>(f: Arrow<A, T<B>>) =>
  (rset: T<A>): T<B> => {
    const result = new Set<B>()
    for (const a of rset) {
      for (const b of f(a)) {
        result.add(b)
      }
    }
    return result
  }

export const from = <A>(iterable: Iterable<A>) => {
  if (iterable instanceof Array) {
    return FpReadonlySet.fromReadonlyArray<A>(eqStrict)(iterable)
  } else {
    return FpReadonlySet.fromReadonlyArray<A>(eqStrict)([...iterable])
  }
}

export const filterUndefined = <A>(rset: T<A | undefined>): T<A> =>
  FpReadonlySet.filter((element: A | undefined) => element !== undefined)(rset) as T<A>
