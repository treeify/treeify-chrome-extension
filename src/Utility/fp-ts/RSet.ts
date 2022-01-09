import { eqStrict } from 'fp-ts/Eq'
import * as FpReadonlySet from 'fp-ts/ReadonlySet'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/ReadonlySet'

type RSet<A> = ReadonlySet<A>

export const add =
  <A>(value: A) =>
  (rset: RSet<A>): RSet<A> => {
    return new Set(rset).add(value)
  }

export const remove = <A>(value: A) => FpReadonlySet.remove<A>(eqStrict)(value)

export const union = <A>(rset1: RSet<A>, rset2: RSet<A>) =>
  FpReadonlySet.union<A>(eqStrict)(rset1, rset2)
export const intersection = <A>(rset1: RSet<A>, rset2: RSet<A>) =>
  FpReadonlySet.intersection<A>(eqStrict)(rset1, rset2)
export const difference = <A>(rset1: RSet<A>, rset2: RSet<A>) =>
  FpReadonlySet.difference<A>(eqStrict)(rset1, rset2)

export const map = <A, B>(f: Arrow<A, B>) => FpReadonlySet.map<B>(eqStrict)(f)

export const flatMap =
  <A, B>(f: Arrow<A, RSet<B>>) =>
  (rset: RSet<A>): RSet<B> => {
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

export const filterUndefined = <A>(rset: RSet<A | undefined>): RSet<A> =>
  FpReadonlySet.filter((element: A | undefined) => element !== undefined)(rset) as RSet<A>
