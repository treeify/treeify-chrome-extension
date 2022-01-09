import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { NERArray } from 'src/Utility/fp-ts/index'

export * from 'fp-ts/ReadonlyNonEmptyArray'

export const last = <A>(nerarray: NERArray<A>): A => RNEA.last(nerarray)
