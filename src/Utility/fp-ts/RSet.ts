import { eqStrict } from 'fp-ts/Eq'
import * as FpSet from 'fp-ts/Set'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/ReadonlySet'

export type T<A> = ReadonlySet<A>

export const map = <A, B>(f: Arrow<A, B>) => FpSet.map<B>(eqStrict)(f)
