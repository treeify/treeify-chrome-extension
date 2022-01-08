import { eqStrict } from 'fp-ts/Eq'
import * as FpReadonlySet from 'fp-ts/ReadonlySet'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/ReadonlySet'

export type T<A> = ReadonlySet<A>

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
