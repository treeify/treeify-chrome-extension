import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'

export * from 'fp-ts/ReadonlyNonEmptyArray'

export type T<A> = RNEA.ReadonlyNonEmptyArray<A>

export const last = <A>(nerarray: T<A>): A => RNEA.last(nerarray)
