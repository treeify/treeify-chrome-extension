import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'

export type T<A> = RNEA.ReadonlyNonEmptyArray<A>

export const last = <A>(nerist: T<A>): A => RNEA.last(nerist)
